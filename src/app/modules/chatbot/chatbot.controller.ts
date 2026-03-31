import { Request, Response } from 'express';
import { asyncHandler } from '../../../utils/async-handler';
import { chatbotService } from './chatbot.service';

const chat = asyncHandler(async (req: Request, res: Response) => {
    const { messages, selectedVariantId, selectedPaymentMethodId } = req.body;
    
    // Đảm bảo client chỉ gửi mảng tối đa 50 tin nhắn gần nhất để AI có đủ trí nhớ
    const recentMessages = messages.slice(-50); 

    const reply = await chatbotService.getChatReply(recentMessages, selectedVariantId, selectedPaymentMethodId);
    
    res.status(200).json({
        success: true,
        data: reply
    });
});

export const chatbotController = {
    chat,
};