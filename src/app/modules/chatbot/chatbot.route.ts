import express from 'express';
import { chatbotController } from './chatbot.controller';
import { validate } from '../../middlewares/validate.middleware'; 
import { chatbotValidation } from './chatbot.validation';

const router = express.Router();

router.post(
    '/', 
    validate(chatbotValidation.chatSchema), 
    chatbotController.chat
);

export const chatbotRoute = router;