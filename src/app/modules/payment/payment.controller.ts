import { Request, Response } from "express";
import { findAllPaymentMethods, findActivePaymentMethods, findPaymentMethodById, createPaymentMethod, updatePaymentMethod, deletePaymentMethod } from "./payment.repository";
import { handlePaymentWebhook, handleSePayWebhook } from "./payment.service";
import { createPaymentMethodSchema, updatePaymentMethodSchema } from "./payment.validation";

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
export const webhookHandler = async (req: Request, res: Response) => {
  try {
    console.log("[SePay Webhook] Received:", JSON.stringify(req.body));
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
