import { Request, Response } from 'express';
import { asyncHandler } from '../../../utils/async-handler';
import { chatbotService } from './chatbot.service';

const chat = asyncHandler(async (req: Request, res: Response) => {
    // 1. Lấy ĐÚNG TÊN CÁC TRƯỜNG mà frontend (chatbox-test.html) gửi lên
    const { 
        messages, 
        selectedVariantId, 
        selectedPaymentMethodId, 
        conversationContext 
    } = req.body;
    
    // Đảm bảo client chỉ gửi mảy tối đa 50 tin nhắn gần nhất để AI có đủ trí nhớ
    const recentMessages = messages.slice(-50); 

    // 2. Truyền ĐÚNG THỨ TỰ vào hàm service
    const reply = await chatbotService.getChatReply(
        recentMessages, 
        selectedVariantId, 
        selectedPaymentMethodId, 
        conversationContext
    );
    
    res.status(200).json({
        success: true,
        data: reply
    });
});

export const chatbotController = {
    chat,
};