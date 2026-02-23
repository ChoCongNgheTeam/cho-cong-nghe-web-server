import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import {
  validateCheckoutHandler,
  checkoutHandler,
  checkoutPreviewHandler,
} from "./checkout.controller";
import { checkoutSchema } from "./checkout.validation";

const router = Router();

// GET /checkout/validate - Validate current cart
router.get("/validate", authMiddleware(), asyncHandler(validateCheckoutHandler));

// GET /checkout/preview - Preview checkout summary
router.get("/preview", authMiddleware(), asyncHandler(checkoutPreviewHandler));

// POST /checkout - Create order from cart
router.post(
  "/",
  authMiddleware(),
  validate(checkoutSchema, "body"),
  asyncHandler(checkoutHandler)
);

export default router;