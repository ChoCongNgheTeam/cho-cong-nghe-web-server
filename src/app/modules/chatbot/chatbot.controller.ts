import { Request, Response } from "express";
import { asyncHandler } from "@/utils/async-handler";
import { chatbotService } from "./chatbot.service";

// ============================================================
// CHATBOT CONTROLLER
// Nhận messages từ FE, gọi service, trả reply
// ============================================================

const chat = asyncHandler(async (req: Request, res: Response) => {
  const { messages } = req.body;

  // FIX: Bỏ slice ở đây — việc giới hạn context đã được xử lý trong service
  // Tránh double-slice gây mất context không nhất quán
  const result = await chatbotService.getChatReply(messages);

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const chatbotController = { chat };