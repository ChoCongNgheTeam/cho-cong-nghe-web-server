import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { validateCheckoutHandler, checkoutPreviewHandler, checkoutHandler } from "./checkout.controller";
import { checkoutSchema, checkoutPreviewSchema } from "./checkout.validation";

const router = Router();

// GET /checkout/validate — Validate giỏ hàng hiện tại
router.get("/validate", authMiddleware(), asyncHandler(validateCheckoutHandler));

// GET /checkout/preview — Preview tổng đơn (có validate query params)
router.get("/preview", authMiddleware(), validate(checkoutPreviewSchema, "query"), asyncHandler(checkoutPreviewHandler));

// POST /checkout — Tạo đơn hàng
router.post("/", authMiddleware(), validate(checkoutSchema, "body"), asyncHandler(checkoutHandler));

export default router;
