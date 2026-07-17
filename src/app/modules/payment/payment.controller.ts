import { Request, Response } from "express";
import { findAllPaymentMethods, findActivePaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod } from "./payment.repository";
import { createPaymentMethodSchema, updatePaymentMethodSchema } from "./payment.validation";
import type { CreateMomoPaymentInput, CreateVnpayPaymentInput, CreateZaloPayPaymentInput, CreateStripePaymentInput } from "./payment.validation";

// Providers
import { handleSePayWebhook } from "./providers/sepay/sepay.service";
import { createMomoPaymentUrl, handleMomoIpn, momoReturnHandler as _momoReturnHandler } from "./providers/momo/momo.service";
import { createVnpayPaymentUrl, handleVnpayIpn, vnpayReturnHandler as _vnpayReturnHandler, getClientIp } from "./providers/vnpay/vnpay.service";
import { createZaloPayPaymentUrl, handleZaloPayCallback, zaloPayReturnHandler as _zaloPayReturnHandler } from "./providers/zalopay/zalopay.service";
import { createStripePaymentIntent, handleStripeWebhook } from "./providers/stripe/stripe.service";
import { stripeReturnHandler as _stripeReturnHandler } from "./providers/stripe/stripe.service";

// Lấy message lỗi an toàn — tránh `error: any` lặp lại ở mọi handler
const getErrorMessage = (error: unknown): string => (error instanceof Error ? error.message : "Đã có lỗi xảy ra");

// Payment Methods (Admin CRUD)

export const getAllPaymentMethodsHandler = async (_: Request, res: Response) => {
  const methods = await findAllPaymentMethods();
  res.json({
    data: methods,
    total: methods.length,
    message: "Lấy danh sách phương thức thanh toán thành công",
  });
};

export const getActivePaymentMethodsHandler = async (_: Request, res: Response) => {
  const methods = await findActivePaymentMethods();
  res.json({
    data: methods,
    message: "Lấy danh sách phương thức thanh toán đang hoạt động thành công",
  });
};

export const createPaymentMethodHandler = async (req: Request, res: Response) => {
  const input = createPaymentMethodSchema.parse(req.body);
  const method = await createPaymentMethod(input);
  res.status(201).json({ data: method, message: "Tạo phương thức thanh toán thành công" });
};

export const updatePaymentMethodHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const input = updatePaymentMethodSchema.parse(req.body);
  const method = await updatePaymentMethod(id, input);
  res.json({ data: method, message: "Cập nhật phương thức thanh toán thành công" });
};

export const deletePaymentMethodHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  await deletePaymentMethod(id);
  res.json({ message: "Xóa phương thức thanh toán thành công" });
};

// SePay

export const sepayWebhookHandler = async (req: Request, res: Response) => {
  try {
    const result = await handleSePayWebhook(req.body, req.headers);
    // SePay cần { success: true } để không retry
    res.json({ success: true, data: result });
  } catch (error: unknown) {
    console.error("[SePay Webhook] Error:", getErrorMessage(error));
    // Trả 200 với success: false để SePay không spam retry
    res.status(200).json({ success: false, message: getErrorMessage(error) });
  }
};

// MoMo

export const createMomoPaymentHandler = async (req: Request, res: Response) => {
  const { orderId, amount, orderInfo } = req.body as CreateMomoPaymentInput;
  const result = await createMomoPaymentUrl(orderId, amount ?? 0, orderInfo);
  res.json({ success: true, data: result });
};

export const momoWebhookHandler = async (req: Request, res: Response) => {
  try {
    const result = await handleMomoIpn(req.body);
    res.json(result);
  } catch (error: unknown) {
    console.error("[MoMo IPN] Error:", getErrorMessage(error));
    res.status(200).json({ success: false, message: getErrorMessage(error) });
  }
};

export const momoReturnHandler = (req: Request, res: Response) => _momoReturnHandler(req, res);

// VNPay

export const createVnpayPaymentHandler = async (req: Request, res: Response) => {
  const { orderId, amount, orderInfo } = req.body as CreateVnpayPaymentInput;
  const ipAddr = getClientIp(req);
  const result = await createVnpayPaymentUrl(orderId, amount ?? 0, orderInfo, ipAddr);
  res.json({ success: true, data: result });
};

export const vnpayWebhookHandler = async (req: Request, res: Response) => {
  try {
    const result = await handleVnpayIpn(req.query);
    res.json(result);
  } catch (error: unknown) {
    console.error("[VNPay IPN] Error:", getErrorMessage(error));
    res.json({ RspCode: "99", Message: getErrorMessage(error) });
  }
};

export const vnpayReturnHandler = (req: Request, res: Response) => _vnpayReturnHandler(req, res);

// ZaloPay

export const createZaloPayPaymentHandler = async (req: Request, res: Response) => {
  const { orderId, amount, description } = req.body as CreateZaloPayPaymentInput;
  const result = await createZaloPayPaymentUrl(orderId, amount ?? 0, description);
  res.json({ success: true, data: result });
};

export const zaloPayCallbackHandler = async (req: Request, res: Response) => {
  try {
    const result = await handleZaloPayCallback(req.body);
    res.json(result);
  } catch (error: unknown) {
    console.error("[ZaloPay CB] Error:", getErrorMessage(error));
    res.json({ return_code: -1, return_message: getErrorMessage(error) });
  }
};

export const zaloPayReturnHandler = (req: Request, res: Response) => _zaloPayReturnHandler(req, res);

// Stripe

/**
 * POST /payment/stripe/create
 * FE gọi để lấy clientSecret → khởi tạo Payment Element
 */
export const createStripePaymentHandler = async (req: Request, res: Response) => {
  const { orderId, amount } = req.body as CreateStripePaymentInput;
  const result = await createStripePaymentIntent(orderId, amount ?? 0);
  res.json({ success: true, data: result });
};

/**
 * POST /payment/webhook/stripe
 * Stripe gọi về sau khi thanh toán
 * ⚠️  Route này PHẢI dùng express.raw() — xem payment.route.ts
 */
export const stripeWebhookHandler = async (req: Request, res: Response) => {
  try {
    const result = await handleStripeWebhook(req);
    res.json(result);
  } catch (error: unknown) {
    console.error("[Stripe Webhook] Error:", getErrorMessage(error));
    // Trả 400 để Stripe biết cần retry
    res.status(400).json({ message: getErrorMessage(error) });
  }
};

/**
 * GET /payment/stripe/return
 * Stripe redirect FE về đây sau khi thanh toán
 */
export const stripeReturnHandler = (req: Request, res: Response): Promise<void> => _stripeReturnHandler(req, res);
