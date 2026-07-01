import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { chatbotController } from "./chatbot.controller";
import { chatSchema } from "./chatbot.validation";

const router = Router();

router.post("/", validate(chatSchema), asyncHandler(chatbotController.chat));

export const chatbotRoute = router;
