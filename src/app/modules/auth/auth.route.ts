import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from "./auth.validation";
import { registerHandler, loginHandler, forgotPasswordHandler, logoutHandler, resetPasswordHandler, changePasswordHandler, refreshTokenHandler } from "./auth.controller";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { forgotPasswordLimiter, loginLimiter, refreshTokenLimiter } from "@/utils/rateLimiter";
import { asyncHandler } from "@/utils/async-handler";

const router = Router();

router.post("/register", validate(registerSchema), asyncHandler(registerHandler));

router.post("/login", loginLimiter, validate(loginSchema), loginHandler);

router.post("/forgot-password", forgotPasswordLimiter, validate(forgotPasswordSchema), forgotPasswordHandler);

router.post("/logout", logoutHandler);

router.post("/refresh", refreshTokenLimiter, refreshTokenHandler);

router.get("/reset-password", (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send("Invalid reset token");
  }

  // redirect sang frontend reset password page
  return res.redirect(`${process.env.FRONTEND_URL}/reset-password?token=${token}`);
});

router.post("/reset-password", validate(resetPasswordSchema), resetPasswordHandler);

router.post("/change-password", authMiddleware(true), validate(changePasswordSchema), changePasswordHandler);

export default router;
