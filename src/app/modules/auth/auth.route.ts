import { Router } from "express";
import { validate } from "@/middlewares/validate.middleware";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.validation";
import {
  registerHandler,
  loginHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
} from "./auth.controller";

const router = Router();

router.post("/register", validate(registerSchema), registerHandler);
router.post("/login", validate(loginSchema), loginHandler);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPasswordHandler);
router.post("/reset-password", validate(resetPasswordSchema), resetPasswordHandler);

export default router;
