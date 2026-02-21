import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import { createReviewHandler, getProductReviewsHandler, getAllReviewsAdminHandler, updateReviewAdminHandler, deleteReviewAdminHandler } from "./review.controller";
import { createReviewSchema, updateReviewAdminSchema } from "./review.validation";
import { asyncHandler } from "@/utils/async-handler";

const router = Router();

const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// Public / User
router.get("/product/:productId", asyncHandler(getProductReviewsHandler));
router.post("/", authMiddleware(), validate(createReviewSchema), asyncHandler(createReviewHandler));

// Admin
router.get("/admin/all", ...adminAuth, asyncHandler(getAllReviewsAdminHandler));
router.patch("/admin/:id", ...adminAuth, validate(updateReviewAdminSchema), asyncHandler(updateReviewAdminHandler));
router.delete("/admin/:id", ...adminAuth, asyncHandler(deleteReviewAdminHandler));

export default router;
