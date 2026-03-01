import * as repo from "./checkout.repository";
import { CheckoutInput, CartValidationResult, CartItemValidation, CheckoutSummary } from "./checkout.types";
import { BadRequestError, NotFoundError } from "@/errors";
import { handlePrismaError } from "@/utils/handle-prisma-error";
import { nanoid } from "nanoid";

export const validateCartItems = async (userId: string): Promise<CartValidationResult> => {
  const cartItems = await repo.findCartItemsWithProduct(userId).catch(handlePrismaError);

  const errors: string[] = [];

  if (cartItems.length === 0) {
    return {
      isValid: false,
      totalItems: 0,
      totalQuantity: 0,
      items: [],
      errors: ["Cart is empty, please add products"],
    };
  }

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

      if (itemErrors.length === 0) {
        totalQuantity += quantity;
      }
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

export const calculateSubtotal = async (userId: string): Promise<number> => {
  const cartItems = await repo.findCartItemsWithProduct(userId);
  return cartItems.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
};

export const calculateShippingFee = async (subtotal: number, shippingAddressId: string): Promise<number> => {
  const FREE_SHIPPING_THRESHOLD = 500000;
  // const DEFAULT_SHIPPING_FEE = 30000;
  const DEFAULT_SHIPPING_FEE = 1000;

  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;

  const address = await repo.findAddressWithProvince(shippingAddressId).catch(handlePrismaError);
  if (!address) return DEFAULT_SHIPPING_FEE;

  const provinceFees: Record<string, number> = {};
  return provinceFees[address.provinceId || ""] || DEFAULT_SHIPPING_FEE;
};

export const calculateTax = (subtotal: number, shippingFee: number, voucherDiscount: number): number => {
  const VAT_RATE = 0.1; // 10%
  const taxableAmount = subtotal + shippingFee - voucherDiscount;
  return Math.round(taxableAmount * VAT_RATE);
};

export const validateAndApplyVoucher = async (voucherId: string | undefined, subtotal: number, userId: string) => {
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

  let discount = voucher.discountType === "DISCOUNT_PERCENT" ? (subtotal * Number(voucher.discountValue)) / 100 : Number(voucher.discountValue);

  return { discount: Math.min(discount, subtotal), voucherData: voucher };
};

export const prepareCheckoutData = async (userId: string, input: CheckoutInput): Promise<CheckoutSummary> => {
  const { paymentMethodId, shippingAddressId, voucherId } = input;

  const cartValidation = await validateCartItems(userId);
  if (!cartValidation.isValid) throw new BadRequestError(`Invalid cart: ${cartValidation.errors.join(", ")}`);

  const paymentMethod = await repo.findPaymentMethodById(paymentMethodId);
  if (!paymentMethod) throw new NotFoundError("Payment method");

  const shippingAddress = await repo.findAddressById(shippingAddressId);
  if (!shippingAddress || shippingAddress.userId !== userId) throw new NotFoundError("Shipping address");

  const subtotalAmount = await calculateSubtotal(userId);

  const cartItems = await repo.findCartItemsWithProduct(userId);
  const items = cartItems.map((item) => ({
    productVariantId: item.productVariantId,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    subtotal: Number(item.unitPrice) * item.quantity,
    productName: item.productVariant.product.name,
    variantCode: item.productVariant.code,
  }));

  const shippingFee = await calculateShippingFee(subtotalAmount, shippingAddressId);
  const { discount: voucherDiscount } = await validateAndApplyVoucher(voucherId, subtotalAmount, userId);
  const taxAmount = calculateTax(subtotalAmount, shippingFee, voucherDiscount);
  const totalAmount = subtotalAmount + shippingFee - voucherDiscount + taxAmount;

  // Generate bankTransferCode nếu là BANK_TRANSFER
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
    shippingAddressId,
    voucherId,
    bankTransferCode,
  };
};

export const createOrderFromCheckout = async (userId: string, checkoutSummary: CheckoutSummary) => {
  try {
    return await repo.executeOrderTransaction(userId, checkoutSummary);
  } catch (error: any) {
    throw new BadRequestError(`Order creation failed: ${error.message}`);
  }
};

export const releaseOrderInventory = async (orderId: string) => {
  return await repo.cancelOrderAndRestoreInventory(orderId);
};

export const confirmOrderAndReduceStock = async (orderId: string) => {
  return await repo.updateOrderStatus(orderId, "PROCESSING");
};
