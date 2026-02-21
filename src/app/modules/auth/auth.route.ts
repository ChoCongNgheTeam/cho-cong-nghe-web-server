import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from "./auth.validation";
import { registerHandler, loginHandler, forgotPasswordHandler, logoutHandler, resetPasswordHandler, changePasswordHandler, refreshTokenHandler } from "./auth.controller";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { forgotPasswordLimiter, loginLimiter, refreshTokenLimiter } from "@/utils/rateLimiter";
import { asyncHandler } from "@/utils/async-handler";

const router = Router();

router.post("/register", validate(registerSchema), asyncHandler(registerHandler));

router.post("/login", loginLimiter, validate(loginSchema), asyncHandler(loginHandler));

router.post("/logout", asyncHandler(logoutHandler));

router.post("/refresh", refreshTokenLimiter, asyncHandler(refreshTokenHandler));

router.post("/forgot-password", forgotPasswordLimiter, validate(forgotPasswordSchema), asyncHandler(forgotPasswordHandler));

router.get("/reset-password", (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send("Invalid reset token");
  return res.redirect(`${process.env.FRONTEND_URL}/reset-password?token=${token}`);
});

router.post("/reset-password", validate(resetPasswordSchema), asyncHandler(resetPasswordHandler));

router.post("/change-password", authMiddleware(true), validate(changePasswordSchema), asyncHandler(changePasswordHandler));

export default router;
