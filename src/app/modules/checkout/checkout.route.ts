import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { validateCheckoutHandler, checkoutPreviewHandler, checkoutHandler } from "./checkout.controller";
import { checkoutSchema, checkoutPreviewSchema, validateCheckoutQuerySchema } from "./checkout.validation";

const router = Router();

// GET /checkout/validate
router.get("/validate", authMiddleware(), validate(validateCheckoutQuerySchema, "query"), asyncHandler(validateCheckoutHandler));

// GET /checkout/preview
router.get("/preview", authMiddleware(), validate(checkoutPreviewSchema, "query"), asyncHandler(checkoutPreviewHandler));

// POST /checkout
router.post("/", authMiddleware(), validate(checkoutSchema, "body"), asyncHandler(checkoutHandler));

export default router;