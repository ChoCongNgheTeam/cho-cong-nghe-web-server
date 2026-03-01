import { Request, Response } from "express";
import { prepareCheckoutData, createOrderFromCheckout, validateCartItems } from "./checkout.service";

/**
 * GET /checkout/validate
 * Validate current cart before checkout
 */
export const validateCheckoutHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const validation = await validateCartItems(userId);

  res.json({
    success: true,
    data: {
      isValid: validation.isValid,
      totalItems: validation.totalItems,
      totalQuantity: validation.totalQuantity,
      items: validation.items,
      errors: validation.errors,
    },
    message: validation.isValid ? "Cart is valid" : "Cart has errors, please check",
  });
};

/**
 * POST /checkout
 * Process checkout and create order
 */
export const checkoutHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const input = req.body;

  const checkoutSummary = await prepareCheckoutData(userId, input);
  const order = await createOrderFromCheckout(userId, checkoutSummary);

  // Build bankTransferInfo nếu có
  const bankTransferInfo = checkoutSummary.bankTransferCode
    ? {
        bankName: process.env.BANK_NAME,
        accountNumber: process.env.BANK_ACCOUNT,
        accountName: process.env.BANK_HOLDER,
        amount: checkoutSummary.totalAmount,
        content: checkoutSummary.bankTransferCode,
        qrCode: `https://img.vietqr.io/image/${process.env.BANK_BIN}-${process.env.BANK_ACCOUNT}-compact2.png?amount=${checkoutSummary.totalAmount}&addInfo=${checkoutSummary.bankTransferCode}`,
      }
    : null;

  res.status(201).json({
    success: true,
    data: {
      orderId: order.id,
      orderCode: order.orderCode,
      orderDate: order.orderDate,
      summary: {
        items: checkoutSummary.items,
        subtotalAmount: checkoutSummary.subtotalAmount,
        shippingFee: checkoutSummary.shippingFee,
        voucherDiscount: checkoutSummary.voucherDiscount,
        taxAmount: checkoutSummary.taxAmount,
        totalAmount: checkoutSummary.totalAmount,
      },
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      bankTransferInfo, // ← null nếu không phải bank transfer
    },
    message: "Order created successfully",
  });
};

/**
 * GET /checkout/preview
 * Preview checkout summary without creating order
 */
export const checkoutPreviewHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { paymentMethodId, shippingAddressId, voucherId } = req.query;

  const input = {
    paymentMethodId: paymentMethodId as string,
    shippingAddressId: shippingAddressId as string,
    voucherId: voucherId as string | undefined,
  };

  const checkoutSummary = await prepareCheckoutData(userId, input);

  res.json({
    success: true,
    data: checkoutSummary,
    message: "Checkout preview retrieved successfully",
  });
};
