import { Request, Response } from "express";
import { findAllPaymentMethods, findActivePaymentMethods, findPaymentMethodById, createPaymentMethod, updatePaymentMethod, deletePaymentMethod } from "./payment.repository";
import { createMomoPaymentUrl, createVnpayPaymentUrl, handleMomoIpn, handleSePayWebhook, handleVnpayIpn } from "./payment.service";
import { createPaymentMethodSchema, updatePaymentMethodSchema } from "./payment.validation";
import { vnpayReturnHandler as vnpayReturnService } from "./payment.service";
import { createZaloPayPaymentUrl, handleZaloPayCallback, zaloPayReturnHandler as zaloPayReturnService } from "./payment.service";

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
  res.status(201).json({
    data: method,
    message: "Tạo phương thức thanh toán thành công",
  });
};

export const updatePaymentMethodHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const input = updatePaymentMethodSchema.parse(req.body);
  const method = await updatePaymentMethod(id, input);
  res.json({
    data: method,
    message: "Cập nhật phương thức thanh toán thành công",
  });
};

export const deletePaymentMethodHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  await deletePaymentMethod(id);
  res.json({ message: "Xóa phương thức thanh toán thành công" });
};

// Webhook endpoint (public, không cần auth)
export const sepayWebhookHandler = async (req: Request, res: Response) => {
  try {
    // console.log("[SePay Webhook] Received:", JSON.stringify(req.body));
    const result = await handleSePayWebhook(req.body, req.headers);
    // SePay cần nhận { success: true } để không retry
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error("[SePay Webhook] Error:", error.message);
    // Vẫn trả 200 với success: false để SePay không spam retry
    // Chỉ trả 4xx nếu muốn SePay retry
    res.status(200).json({ success: false, message: error.message });
  }
};

// POST /payment/momo/create - FE gọi để lấy paymentUrl
export const createMomoPaymentHandler = async (req: Request, res: Response) => {
  const { orderId, amount, orderInfo } = req.body;
  const result = await createMomoPaymentUrl(orderId, amount, orderInfo);
  res.json({ success: true, data: result });
};

import { momoReturnHandler as momoReturnService } from "./payment.service";

export const momoReturnHandler = async (req: Request, res: Response) => {
  return momoReturnService(req, res);
};

// POST /payment/webhook/momo - MoMo IPN gọi vào
export const momoWebhookHandler = async (req: Request, res: Response) => {
  try {
    console.log("[MoMo IPN] Received:", JSON.stringify(req.body));
    const result = await handleMomoIpn(req.body);
    res.json(result);
  } catch (error: any) {
    console.error("[MoMo IPN] Error:", error.message);
    res.status(200).json({ success: false, message: error.message });
  }
};

// FE gọi để lấy paymentUrl
export const createVnpayPaymentHandler = async (req: Request, res: Response) => {
  const { orderId, amount, orderInfo } = req.body;
  // console.log("BODY:", req.body);

  if (!orderId || !amount || !orderInfo) {
    return res.status(400).json({
      message: "Missing required fields",
      orderId,
      amount,
      orderInfo,
    });
  }

  const rawIp = req.headers["x-forwarded-for"]?.toString().split(",")[0] || req.socket.remoteAddress || "127.0.0.1";

  // Convert IPv6 loopback về IPv4
  const ipAddr = rawIp === "::1" ? "127.0.0.1" : rawIp.replace(/^::ffff:/, "");

  const result = await createVnpayPaymentUrl(orderId, amount, orderInfo, ipAddr);
  res.json({ success: true, data: result });
};

// VNPay IPN dùng GET với query params
export const vnpayWebhookHandler = async (req: Request, res: Response) => {
  try {
    // console.log("=== [VNPay IPN] CALLED ===");
    // console.log("[VNPay IPN] Received:", req.query);
    const result = await handleVnpayIpn(req.query);
    res.json(result);
  } catch (error: any) {
    console.error("[VNPay IPN] Error:", error.message);
    res.json({ RspCode: "99", Message: error.message });
  }
};

export const vnpayReturnHandler = async (req: Request, res: Response) => {
  return vnpayReturnService(req, res);
};

export const createZaloPayPaymentHandler = async (req: Request, res: Response) => {
  const { orderId, amount, description } = req.body;
  const result = await createZaloPayPaymentUrl(orderId, amount, description);
  res.json({ success: true, data: result });
};

export const zaloPayCallbackHandler = async (req: Request, res: Response) => {
  try {
    console.log("[ZaloPay CB] Received:", req.body);
    const result = await handleZaloPayCallback(req.body);
    res.json(result);
  } catch (error: any) {
    console.error("[ZaloPay CB] Error:", error.message);
    res.json({ return_code: -1, return_message: error.message });
  }
};

export const zaloPayReturnHandler = async (req: Request, res: Response) => {
  return zaloPayReturnService(req, res);
};
