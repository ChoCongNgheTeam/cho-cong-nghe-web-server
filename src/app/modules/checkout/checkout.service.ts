import * as repo from "./checkout.repository";
import { CheckoutInput, CartValidationResult, CartItemValidation, CheckoutSummary } from "./checkout.types";
import { BadRequestError, NotFoundError } from "@/errors";
import { handlePrismaError } from "@/utils/handle-prisma-error";
import { nanoid } from "nanoid";

// Cart validation

export const validateCartItems = async (userId: string): Promise<CartValidationResult> => {
  const cartItems = await repo.findCartItemsWithProduct(userId).catch(handlePrismaError);

  if (cartItems.length === 0) {
    return {
      isValid: false,
      totalItems: 0,
      totalQuantity: 0,
      items: [],
      errors: ["Cart is empty, please add products"],
    };
  }

  const errors: string[] = [];
  const validatedItems: CartItemValidation[] = [];
  let totalQuantity = 0;

  for (const item of cartItems) {
    const { productVariant, quantity } = item;
    const itemErrors: string[] = [];

    if (!productVariant) {
      itemErrors.push("Product does not exist");
    } else {
      const { product, quantity: availableQuantity, isActive } = productVariant;

      if (!isActive) itemErrors.push(`${product.name} (variant) is no longer available`);
      if (!product.isActive) itemErrors.push(`${product.name} is no longer available`);
      if (availableQuantity < quantity) itemErrors.push(`${product.name} only has ${availableQuantity} items available (you requested ${quantity})`);

      if (itemErrors.length === 0) totalQuantity += quantity;
    }

    validatedItems.push({
      productVariantId: item.productVariantId,
      quantity,
      unitPrice: item.unitPrice,
      isValid: itemErrors.length === 0,
      errors: itemErrors,
      productName: productVariant?.product?.name,
      variantCode: productVariant?.code || undefined,
    });

    if (itemErrors.length > 0) errors.push(...itemErrors);
  }

  return {
    isValid: validatedItems.every((item) => item.isValid),
    totalItems: cartItems.length,
    totalQuantity,
    items: validatedItems,
    errors,
  };
};

// Pricing calculations

const SHIPPING_FREE_THRESHOLD = 500_000;
const SHIPPING_DEFAULT_FEE = 1_000; // đổi lại 30_000 khi production
const VAT_RATE = 0.1;

export const calculateShippingFee = async (subtotal: number, shippingAddressId: string): Promise<number> => {
  if (subtotal >= SHIPPING_FREE_THRESHOLD) return 0;

  const address = await repo.findAddressWithProvince(shippingAddressId).catch(handlePrismaError);
  if (!address) return SHIPPING_DEFAULT_FEE;

  // Mở rộng: map theo province nếu cần
  const provinceFees: Record<string, number> = {};
  return provinceFees[address.provinceId ?? ""] ?? SHIPPING_DEFAULT_FEE;
};

export const calculateTax = (subtotal: number, shippingFee: number, voucherDiscount: number): number => {
  const taxableAmount = subtotal + shippingFee - voucherDiscount;
  return Math.round(Math.max(taxableAmount, 0) * VAT_RATE);
};

// Voucher

export const validateAndApplyVoucher = async (voucherId: string | undefined, subtotal: number, userId: string): Promise<{ discount: number; voucherData: any | null }> => {
  if (!voucherId) return { discount: 0, voucherData: null };

  const voucher = await repo.findVoucherWithUser(voucherId, userId).catch(handlePrismaError);
  if (!voucher) throw new NotFoundError("Voucher");
  if (!voucher.isActive) throw new BadRequestError("Voucher is no longer active");

  const now = new Date();
  if (voucher.startDate && voucher.startDate > now) throw new BadRequestError("Voucher is not yet valid");
  if (voucher.endDate && voucher.endDate < now) throw new BadRequestError("Voucher has expired");
  if (voucher.maxUses && voucher.usesCount >= voucher.maxUses) throw new BadRequestError("Voucher has reached maximum usage limit");
  if (subtotal < Number(voucher.minOrderValue)) throw new BadRequestError(`Minimum order value is ${Number(voucher.minOrderValue).toLocaleString()} VND to use this voucher`);

  const usersCount = await repo.findVoucherUsersCount(voucherId);
  if (usersCount > 0) {
    const userVoucher = voucher.voucherUsers[0];
    if (!userVoucher) throw new BadRequestError("You are not allowed to use this voucher");
    if (userVoucher.usedCount >= userVoucher.maxUses) throw new BadRequestError("You have reached the maximum usage limit for this voucher");
  }

  const discount = voucher.discountType === "DISCOUNT_PERCENT" ? (subtotal * Number(voucher.discountValue)) / 100 : Number(voucher.discountValue);

  return { discount: Math.min(discount, subtotal), voucherData: voucher };
};

// Prepare checkout summary
// FIX: cartItems chỉ query 1 lần duy nhất

export const prepareCheckoutData = async (userId: string, input: CheckoutInput): Promise<CheckoutSummary> => {
  const { paymentMethodId, shippingAddressId, voucherId } = input;

  // Validate cart (1 lần query)
  const cartValidation = await validateCartItems(userId);
  if (!cartValidation.isValid) throw new BadRequestError(`Invalid cart: ${cartValidation.errors.join(", ")}`);

  // Validate payment method & address (parallel)
  const [paymentMethod, shippingAddress] = await Promise.all([repo.findPaymentMethodById(paymentMethodId), repo.findAddressById(shippingAddressId)]);
  if (!paymentMethod) throw new NotFoundError("Payment method");
  if (!shippingAddress || shippingAddress.userId !== userId) throw new NotFoundError("Shipping address");

  // Build items từ validated cart (không query lại)
  const items = cartValidation.items.map((item) => ({
    productVariantId: item.productVariantId,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    subtotal: Number(item.unitPrice) * item.quantity,
    productName: item.productName ?? "",
    variantCode: item.variantCode ?? null,
  }));

  const subtotalAmount = items.reduce((sum, i) => sum + i.subtotal, 0);

  // Parallel: shipping fee + voucher
  const [shippingFee, { discount: voucherDiscount }] = await Promise.all([calculateShippingFee(subtotalAmount, shippingAddressId), validateAndApplyVoucher(voucherId, subtotalAmount, userId)]);

  const taxAmount = calculateTax(subtotalAmount, shippingFee, voucherDiscount);
  const totalAmount = subtotalAmount + shippingFee - voucherDiscount + taxAmount;

  const isBankTransfer = paymentMethod.code === "BANK_TRANSFER";
  const bankTransferCode = isBankTransfer ? `TT${nanoid(8).toUpperCase()}` : undefined;

  return {
    items,
    subtotalAmount,
    shippingFee,
    voucherDiscount,
    taxAmount,
    totalAmount,
    paymentMethodId,
    paymentMethodCode: paymentMethod.code,
    shippingAddressId,
    voucherId,
    bankTransferCode,
  };
};

// Order actions

export const createOrderFromCheckout = async (userId: string, checkoutSummary: CheckoutSummary) => {
  try {
    return await repo.executeOrderTransaction(userId, checkoutSummary);
  } catch (error: any) {
    throw new BadRequestError(`Order creation failed: ${error.message}`);
  }
};

export const releaseOrderInventory = async (orderId: string) => {
  return repo.cancelOrderAndRestoreInventory(orderId);
};

export const confirmOrderAndReduceStock = async (orderId: string) => {
  return repo.updateOrderStatus(orderId, "PROCESSING");
};
