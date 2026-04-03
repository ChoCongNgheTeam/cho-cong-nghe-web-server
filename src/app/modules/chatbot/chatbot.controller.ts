import { Request, Response } from "express";
import { asyncHandler } from "@/utils/async-handler";
import { chatbotService } from "./chatbot.service";

// ============================================================
// CHATBOT CONTROLLER
// Nhận messages từ FE, gọi service, trả reply
// ============================================================

const chat = asyncHandler(async (req: Request, res: Response) => {
  const { messages } = req.body;

  // Chỉ lấy 10 turn gần nhất (20 messages), FE không cần quản lý
  const recentMessages = messages.slice(-20);

  const result = await chatbotService.getChatReply(recentMessages);

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const chatbotController = { chat };
