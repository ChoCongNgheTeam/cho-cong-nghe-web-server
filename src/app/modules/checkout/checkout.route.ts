import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import {
  validateCheckoutHandler,
  checkoutHandler,
  checkoutPreviewHandler,
} from "./checkout.controller";
import { checkoutSchema } from "./checkout.validation";

const router = Router();

// GET /checkout/validate - Validate current cart
// SỬA: Thêm (true) vào sau authMiddleware
router.get("/validate", authMiddleware(true), validateCheckoutHandler);

// GET /checkout/preview - Preview checkout summary
// SỬA: Thêm (true) vào sau authMiddleware
router.get("/preview", authMiddleware(true), checkoutPreviewHandler);

// POST /checkout - Create order from cart
// SỬA: Thêm (true) và thêm "body" vào hàm validate
router.post(
  "/",
  authMiddleware(true),
  validate(checkoutSchema, "body"), 
  checkoutHandler
);

export default router;