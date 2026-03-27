// auth.route.ts (đã thêm OAuth routes)
import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from "./auth.validation";
import { googleLoginSchema, facebookLoginSchema, appleLoginSchema } from "./oauth/oauth.validation";
import { registerHandler, loginHandler, forgotPasswordHandler, logoutHandler, resetPasswordHandler, changePasswordHandler, refreshTokenHandler } from "./auth.controller";
import { googleLoginHandler, facebookLoginHandler, appleLoginHandler, facebookCallbackHandler } from "./oauth/oauth.controller";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { forgotPasswordLimiter, loginLimiter, refreshTokenLimiter } from "@/utils/rateLimiter";
import { asyncHandler } from "@/utils/async-handler";

const router = Router();

// Credentials
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

// OAuth
router.post("/oauth/google", loginLimiter, validate(googleLoginSchema), asyncHandler(googleLoginHandler));
router.post("/oauth/facebook", loginLimiter, validate(facebookLoginSchema), asyncHandler(facebookLoginHandler));
router.get("/oauth/facebook/init", (req, res) => {
   const returnUrl =
      typeof req.query.returnUrl === "string" ? req.query.returnUrl : "/";
   const redirectUri = `${process.env.API_BASE_URL}/api/v1/auth/oauth/facebook/callback`;
   const params = new URLSearchParams({
      client_id: process.env.FB_APP_ID!,
      redirect_uri: redirectUri,
      scope: "public_profile,email",
      response_type: "code",
      state: returnUrl,
   });
   res.redirect(`https://www.facebook.com/v25.0/dialog/oauth?${params}`);
});
router.get("/oauth/facebook/callback", asyncHandler(facebookCallbackHandler));
router.post("/oauth/apple", loginLimiter, validate(appleLoginSchema), asyncHandler(appleLoginHandler));

export default router;
