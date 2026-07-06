import { Request, Response } from "express";
import { asyncHandler } from "@/utils/async-handler";
import { chatbotService } from "./chatbot.service";

// ============================================================
// CHATBOT CONTROLLER
// Nhận messages từ FE, gọi service, trả reply
// ============================================================

const chat = asyncHandler(async (req: Request, res: Response) => {
  const { messages, sessionId } = req.body;
  const userId = (req as any).user?.id; // Lấy userId nếu khách đã login

  const startTime = performance.now();
  
  const result = await chatbotService.getChatReply(messages, sessionId, userId);

  const endTime = performance.now();
  const responseTimeMs = endTime - startTime;
  const responseTimeStr = `${(responseTimeMs / 1000).toFixed(2)}s`;

  res.status(200).json({
    success: true,
    data: {
      ...result,
      responseTime: responseTimeStr
    }
  });
});

export const chatbotController = { chat };