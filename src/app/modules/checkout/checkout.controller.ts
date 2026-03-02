import { Request, Response } from "express";
import { prepareCheckoutData, createOrderFromCheckout, validateCartItems } from "./checkout.service";
import { createMomoPaymentUrl, createVnpayPaymentUrl } from "../payment/payment.service";

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

  // Xác định payment info theo loại
  let paymentInfo: any = null;
  const methodCode = checkoutSummary.paymentMethodCode.toUpperCase();

  if (methodCode?.includes("BANK_TRANSFER") && checkoutSummary.bankTransferCode) {
    paymentInfo = {
      type: "BANK_TRANSFER",
      bankName: process.env.BANK_NAME,
      accountNumber: process.env.BANK_ACCOUNT,
      accountName: process.env.BANK_HOLDER,
      amount: checkoutSummary.totalAmount,
      content: checkoutSummary.bankTransferCode,
      qrCode: `https://img.vietqr.io/image/${process.env.BANK_BIN}-${process.env.BANK_ACCOUNT}-compact2.png?amount=${checkoutSummary.totalAmount}&addInfo=${checkoutSummary.bankTransferCode}`,
    };
  } else if (methodCode?.includes("MOMO")) {
    const momo = await createMomoPaymentUrl(order.id, checkoutSummary.totalAmount, `Thanh toan don hang ${order.orderCode}`);
    paymentInfo = { type: "MOMO", ...momo };
  } else if (methodCode?.includes("VNPAY")) {
    const ipAddr = req.headers["x-forwarded-for"]?.toString().split(",")[0] || req.socket.remoteAddress || "127.0.0.1";
    const vnpay = await createVnpayPaymentUrl(order.id, checkoutSummary.totalAmount, `Thanh toan don hang ${order.orderCode}`, ipAddr);
    paymentInfo = { type: "VNPAY", ...vnpay };
  }

  res.status(201).json({
    success: true,
    data: {
      orderId: order.id,
      orderCode: order.orderCode,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      summary: {
        /* ... */
      },
      paymentInfo, // ← FE dùng paymentInfo.paymentUrl để redirect
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
