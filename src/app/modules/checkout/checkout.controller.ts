import { Request, Response } from "express";
import { prepareCheckoutData, createOrderFromCheckout, validateCartItems } from "./checkout.service";

// Payment providers
import { createMomoPaymentUrl } from "../payment/providers/momo/momo.service";
import { createVnpayPaymentUrl, getClientIp } from "../payment/providers/vnpay/vnpay.service";
import { createZaloPayPaymentUrl } from "../payment/providers/zalopay/zalopay.service";

import { CheckoutSummary } from "./checkout.types";
import { createStripePaymentIntent } from "../payment/providers/stripe/stripe.service";

// Payment info builder
// Tách riêng để dễ test và mở rộng thêm provider mới

const buildPaymentInfo = async (req: Request, orderId: string, orderCode: string, summary: CheckoutSummary): Promise<Record<string, any> | null> => {
  const methodCode = summary.paymentMethodCode.toUpperCase();
  const orderInfo = `Thanh toan don hang ${orderCode}`;

  if (methodCode.includes("BANK_TRANSFER") && summary.bankTransferCode) {
    return {
      type: "BANK_TRANSFER",
      bankName: process.env.BANK_NAME,
      accountNumber: process.env.BANK_ACCOUNT,
      accountName: process.env.BANK_HOLDER,
      amount: summary.totalAmount,
      content: summary.bankTransferCode,
      qrCode: `https://img.vietqr.io/image/${process.env.BANK_BIN}-${process.env.BANK_ACCOUNT}-compact2.png?amount=${summary.totalAmount}&addInfo=${summary.bankTransferCode}`,
    };
  }

  if (methodCode.includes("MOMO")) {
    const momo = await createMomoPaymentUrl(orderId, summary.totalAmount, orderInfo);
    return { type: "MOMO", ...momo };
  }

  if (methodCode.includes("VNPAY")) {
    const ipAddr = getClientIp(req);
    const vnpay = await createVnpayPaymentUrl(orderId, summary.totalAmount, orderInfo, ipAddr);
    return { type: "VNPAY", ...vnpay };
  }

  if (methodCode.includes("ZALOPAY")) {
    const zalopay = await createZaloPayPaymentUrl(orderId, summary.totalAmount, orderInfo);
    return { type: "ZALOPAY", ...zalopay };
  }

  if (methodCode.includes("STRIPE") || methodCode.includes("CREDIT_CARD")) {
    const stripe = await createStripePaymentIntent(orderId, summary.totalAmount);
    return { type: "STRIPE", ...stripe };
    // FE nhận clientSecret + publishableKey để render Payment Element
  }

  // COD hoặc payment method không cần redirect
  return null;
};

// Handlers

/**
 * GET /checkout/validate
 * Validate giỏ hàng hiện tại trước khi checkout
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
 * GET /checkout/preview
 * Preview tổng đơn hàng mà không tạo order
 */
export const checkoutPreviewHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { paymentMethodId, shippingAddressId, voucherId } = req.query;

  // Normalize voucherId: bỏ qua empty string
  const input = {
    paymentMethodId: paymentMethodId as string,
    shippingAddressId: shippingAddressId as string,
    voucherId: voucherId && voucherId !== "" ? (voucherId as string) : undefined,
  };

  const checkoutSummary = await prepareCheckoutData(userId, input);

  res.json({
    success: true,
    data: checkoutSummary,
    message: "Checkout preview retrieved successfully",
  });
};

/**
 * POST /checkout
 * Tạo đơn hàng từ giỏ hàng
 */
export const checkoutHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const input = req.body;

  const checkoutSummary = await prepareCheckoutData(userId, input);
  const order = await createOrderFromCheckout(userId, checkoutSummary);

  const paymentInfo = await buildPaymentInfo(req, order.id, order.orderCode, checkoutSummary);

  res.status(201).json({
    success: true,
    data: {
      orderId: order.id,
      orderCode: order.orderCode,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      summary: {
        subtotalAmount: checkoutSummary.subtotalAmount,
        shippingFee: checkoutSummary.shippingFee,
        voucherDiscount: checkoutSummary.voucherDiscount,
        taxAmount: checkoutSummary.taxAmount,
        totalAmount: checkoutSummary.totalAmount,
        itemCount: checkoutSummary.items.length,
      },
      paymentInfo, // FE dùng paymentInfo.paymentUrl để redirect
    },
    message: "Order created successfully",
  });
};
