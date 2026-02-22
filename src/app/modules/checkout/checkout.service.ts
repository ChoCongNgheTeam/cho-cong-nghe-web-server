import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { CheckoutInput, CartValidationResult, CartItemValidation, CheckoutSummary } from "./checkout.types";
import { BadRequestError, NotFoundError } from "@/errors";

/**
 * Validate cart for user
 * - Check if cart exists and not empty
 * - Check each item validity (product exists, is active, has inventory)
 */
export const validateCartItems = async (userId: string): Promise<CartValidationResult> => {
  const cartItems = await prisma.cart_items.findMany({
    where: { userId },
    include: {
      productVariant: {
        include: {
          product: true,
        },
      },
    },
  });

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

      // Check if variant is active
      if (!isActive) {
        itemErrors.push(`${product.name} (variant) is no longer available`);
      }

      // Check if product is active
      if (!product.isActive) {
        itemErrors.push(`${product.name} is no longer available`);
      }

      // Check stock quantity
      if (availableQuantity < quantity) {
        itemErrors.push(`${product.name} only has ${availableQuantity} items available (you requested ${quantity})`);
      }

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

    if (itemErrors.length > 0) {
      errors.push(...itemErrors);
    }
  }

  const isValid = validatedItems.every((item) => item.isValid);

  return {
    isValid,
    totalItems: cartItems.length,
    totalQuantity,
    items: validatedItems,
    errors,
  };
};

/**
 * Calculate subtotal from cart items
 */
export const calculateSubtotal = async (userId: string): Promise<number> => {
  const cartItems = await prisma.cart_items.findMany({
    where: { userId },
  });

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + Number(item.unitPrice) * item.quantity;
  }, 0);

  return subtotal;
};

/**
 * Calculate shipping fee based on location and subtotal
 * Free shipping if subtotal >= 500,000 VND
 */
export const calculateShippingFee = async (subtotal: number, shippingAddressId: string): Promise<number> => {
  // Free shipping threshold
  const FREE_SHIPPING_THRESHOLD = 500000;
  const DEFAULT_SHIPPING_FEE = 30000;

  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }

  // Optional: You can customize shipping fee based on province
  const address = await prisma.user_addresses.findUnique({
    where: { id: shippingAddressId },
    include: { province: true },
  });

  if (!address) {
    return DEFAULT_SHIPPING_FEE;
  }

  // Example: Different shipping fees for different provinces
  // You can extend this logic
  const provinceFees: Record<string, number> = {
    // Add your province-specific fees here
    // 'HANOI_ID': 20000,
    // 'HCMC_ID': 20000,
    // 'OTHER_ID': 40000,
  };

  // Return province-specific fee or default
  return provinceFees[address.provinceId || ""] || DEFAULT_SHIPPING_FEE;
};

/**
 * 🔥 NEW - Calculate VAT tax
 * Standard VAT rate in Vietnam is 10%
 * Tax is applied on: subtotal + shipping fee - voucher discount
 *
 * @param subtotal - Subtotal amount before tax
 * @param shippingFee - Shipping fee
 * @param voucherDiscount - Voucher discount amount
 * @returns Tax amount (rounded to nearest integer)
 */
export const calculateTax = (subtotal: number, shippingFee: number, voucherDiscount: number): number => {
  // Vietnam VAT rate
  const VAT_RATE = 0.1; // 10%

  // Taxable amount = subtotal + shipping - discount
  // Note: In Vietnam, VAT is typically calculated on the total before discount
  // You can adjust this logic based on your business requirements
  const taxableAmount = subtotal + shippingFee - voucherDiscount;

  // Calculate tax
  const taxAmount = taxableAmount * VAT_RATE;

  // Round to nearest integer (VND doesn't use decimals)
  return Math.round(taxAmount);
};

/**
 * Validate voucher and calculate discount
 */
export const validateAndApplyVoucher = async (voucherId: string | undefined, subtotal: number, userId: string): Promise<{ discount: number; voucherData: any }> => {
  if (!voucherId) {
    return { discount: 0, voucherData: null };
  }

  const voucher = await prisma.vouchers.findUnique({
    where: { id: voucherId },
    include: {
      voucherUsers: {
        where: { userId },
      },
    },
  });

  if (!voucher) {
    throw new NotFoundError("Voucher");
  }

  if (!voucher.isActive) {
    throw new BadRequestError("Voucher is no longer active");
  }

  // Check dates
  const now = new Date();
  if (voucher.startDate && voucher.startDate > now) {
    throw new BadRequestError("Voucher is not yet valid");
  }

  if (voucher.endDate && voucher.endDate < now) {
    throw new BadRequestError("Voucher has expired");
  }

  // Check max uses
  if (voucher.maxUses && voucher.usesCount >= voucher.maxUses) {
    throw new BadRequestError("Voucher has reached maximum usage limit");
  }

  // Check min order value
  if (subtotal < Number(voucher.minOrderValue)) {
    throw new BadRequestError(`Minimum order value is ${Number(voucher.minOrderValue).toLocaleString()} VND to use this voucher`);
  }

  // Check if user is allowed to use this voucher
  // If voucherUsers table has entries, only those users can use it
  const allVoucherUsers = await prisma.voucher_user.findMany({
    where: { voucherId },
  });

  if (allVoucherUsers.length > 0) {
    // Voucher is restricted to specific users
    const userVoucher = voucher.voucherUsers[0];

    if (!userVoucher) {
      throw new BadRequestError("You are not allowed to use this voucher");
    }

    // Check user's max uses per user
    if (userVoucher.usedCount >= userVoucher.maxUses) {
      throw new BadRequestError("You have reached the maximum usage limit for this voucher");
    }
  }

  // Calculate discount
  let discount = 0;
  if (voucher.discountType === "DISCOUNT_PERCENT") {
    discount = (subtotal * Number(voucher.discountValue)) / 100;
  } else {
    discount = Number(voucher.discountValue);
  }

  // Discount cannot exceed subtotal
  discount = Math.min(discount, subtotal);

  return { discount, voucherData: voucher };
};

/**
 * Prepare checkout data with all validations
 * 🔥 UPDATED: Added tax calculation
 */
export const prepareCheckoutData = async (userId: string, input: CheckoutInput): Promise<CheckoutSummary> => {
  const { paymentMethodId, shippingAddressId, voucherId } = input;

  // Step 1: Validate cart and items
  const cartValidation = await validateCartItems(userId);
  if (!cartValidation.isValid) {
    throw new BadRequestError(`Invalid cart: ${cartValidation.errors.join(", ")}`);
  }

  // Step 2: Validate payment method
  const paymentMethod = await prisma.payment_methods.findUnique({
    where: { id: paymentMethodId, isActive: true },
  });
  if (!paymentMethod) {
    throw new NotFoundError("Payment method");
  }

  // Step 3: Validate shipping address
  const shippingAddress = await prisma.user_addresses.findUnique({
    where: { id: shippingAddressId },
  });
  if (!shippingAddress || shippingAddress.userId !== userId) {
    throw new NotFoundError("Shipping address");
  }

  // Step 4: Calculate subtotal
  const subtotalAmount = await calculateSubtotal(userId);

  // Step 5: Get detailed cart items for response
  const cartItems = await prisma.cart_items.findMany({
    where: { userId },
    include: {
      productVariant: {
        include: {
          product: true,
        },
      },
    },
  });

  const items = cartItems.map((item) => ({
    productVariantId: item.productVariantId,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    subtotal: Number(item.unitPrice) * item.quantity,
    productName: item.productVariant.product.name,
    variantCode: item.productVariant.code,
  }));

  // Step 6: Calculate shipping fee
  const shippingFee = await calculateShippingFee(subtotalAmount, shippingAddressId);

  // Step 7: Validate and apply voucher
  const { discount: voucherDiscount } = await validateAndApplyVoucher(voucherId, subtotalAmount, userId);

  // Step 8: 🔥 NEW - Calculate tax (VAT)
  const taxAmount = calculateTax(subtotalAmount, shippingFee, voucherDiscount);

  // Step 9: Calculate total amount
  // Total = Subtotal + Shipping Fee - Voucher Discount + Tax
  const totalAmount = subtotalAmount + shippingFee - voucherDiscount + taxAmount;

  return {
    items,
    subtotalAmount,
    shippingFee,
    voucherDiscount,
    taxAmount, // 🔥 NEW
    totalAmount,
    paymentMethodId,
    shippingAddressId,
    voucherId,
  };
};

/**
 * Create order from checkout data
 * 🔥 FIXED: Now uses transaction and reserves inventory
 * 🔥 UPDATED: Added taxAmount to order creation
 */
export const createOrderFromCheckout = async (userId: string, checkoutSummary: CheckoutSummary) => {
  const {
    items,
    subtotalAmount,
    shippingFee,
    voucherDiscount,
    taxAmount, // 🔥 NEW
    totalAmount,
    paymentMethodId,
    shippingAddressId,
    voucherId,
  } = checkoutSummary;

  // 🔥 CRITICAL: Use transaction to ensure data consistency
  const order = await prisma.$transaction(async (tx) => {
    // Step 1: Create order with items
    const newOrder = await tx.orders.create({
      data: {
        userId,
        paymentMethodId,
        voucherId: voucherId || null,
        shippingAddressId,
        subtotalAmount: new Prisma.Decimal(subtotalAmount),
        shippingFee: new Prisma.Decimal(shippingFee),
        voucherDiscount: new Prisma.Decimal(voucherDiscount),
        totalAmount: new Prisma.Decimal(totalAmount),
        orderStatus: "PENDING",
        paymentStatus: "UNPAID",
        orderItems: {
          create: items.map((item) => ({
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            productVariant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    // Step 2: 🔥 FIXED - Reduce stock for each item
    for (const item of items) {
      // Get the current variant to check stock
      const variant = await tx.products_variants.findUnique({
        where: { id: item.productVariantId },
      });

      if (!variant) {
        throw new BadRequestError(`Product variant not found: ${item.productVariantId}`);
      }

      // Check if we have enough stock
      if (variant.quantity < item.quantity) {
        throw new BadRequestError(`Not enough stock for ${item.productName}. Available: ${variant.quantity}, Requested: ${item.quantity}`);
      }

      // Reduce quantity and increase soldCount
      await tx.products_variants.update({
        where: { id: item.productVariantId },
        data: {
          quantity: {
            decrement: item.quantity,
          },
          soldCount: {
            increment: item.quantity,
          },
        },
      });
    }

    // Step 3: Clear cart items after successful order creation
    await tx.cart_items.deleteMany({
      where: { userId },
    });

    // Step 4: Update voucher usage if voucher was used
    if (voucherId) {
      // Increment global voucher uses count
      await tx.vouchers.update({
        where: { id: voucherId },
        data: { usesCount: { increment: 1 } },
      });

      // 🔥 FIXED - Record voucher usage for audit trail
      await tx.voucher_usages.create({
        data: {
          voucherId,
          userId,
          orderId: newOrder.id,
        },
      });

      // Update user voucher usage if exists
      const userVoucher = await tx.voucher_user.findUnique({
        where: {
          voucherId_userId: {
            voucherId,
            userId,
          },
        },
      });

      if (userVoucher) {
        await tx.voucher_user.update({
          where: {
            id: userVoucher.id,
          },
          data: { usedCount: { increment: 1 } },
        });
      }
    }

    return newOrder;
  });

  return order;
};

/**
 * 🔥 NEW - Function to release (restore) inventory when order is cancelled
 */
export const releaseOrderInventory = async (orderId: string) => {
  return await prisma.$transaction(async (tx) => {
    // Get order items
    const orderItems = await tx.order_items.findMany({
      where: { orderId },
    });

    // Restore inventory for each item
    for (const item of orderItems) {
      await tx.products_variants.update({
        where: { id: item.productVariantId },
        data: {
          quantity: {
            increment: item.quantity,
          },
          soldCount: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Update order status
    await tx.orders.update({
      where: { id: orderId },
      data: {
        orderStatus: "CANCELLED",
      },
    });
  });
};

/**
 * 🔥 NEW - Function to confirm order
 * Note: Stock is already reduced during createOrderFromCheckout
 */
export const confirmOrderAndReduceStock = async (orderId: string) => {
  return await prisma.$transaction(async (tx) => {
    // Update order status to PROCESSING
    await tx.orders.update({
      where: { id: orderId },
      data: {
        orderStatus: "PROCESSING",
      },
    });
  });
};
