import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "./auth.validation";
import {
  registerHandler,
  loginHandler,
  forgotPasswordHandler,
  logoutHandler,
  resetPasswordHandler,
  changePasswordHandler,
  refreshTokenHandler,
} from "./auth.controller";
import { authMiddleware } from "@/app/middlewares/auth.middleware";

const router = Router();

router.post("/register", validate(registerSchema), registerHandler);
router.post("/login", validate(loginSchema), loginHandler);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPasswordHandler);
router.post("/logout", logoutHandler);

router.post("/refresh", refreshTokenHandler);

router.get("/reset-password", (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send("Invalid reset token");
  }

  // redirect sang frontend reset password page
  return res.redirect(`${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`);
});

router.post("/reset-password", validate(resetPasswordSchema), resetPasswordHandler);

router.post(
  "/change-password",
  authMiddleware,
  validate(changePasswordSchema),
  changePasswordHandler
);

export default router;
