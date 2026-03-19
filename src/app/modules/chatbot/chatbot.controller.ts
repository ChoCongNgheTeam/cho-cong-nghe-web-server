import { Request, Response } from 'express';
import { asyncHandler } from '../../../utils/async-handler';
import { chatbotService } from './chatbot.service';

const chat = asyncHandler(async (req: Request, res: Response) => {
    const { messages } = req.body;
    
    // Đảm bảo client chỉ gửi mảng tối đa 5-6 tin nhắn gần nhất để tiết kiệm chi phí
    const recentMessages = messages.slice(-6); 

    const reply = await chatbotService.getChatReply(recentMessages);
    
    res.status(200).json({
        success: true,
        data: reply
    });
});

export const chatbotController = {
    chat,
};