import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import { createReviewHandler, getProductReviewsHandler, getAllReviewsAdminHandler, updateReviewAdminHandler, deleteReviewAdminHandler } from "./review.controller";
import { createReviewSchema, updateReviewAdminSchema } from "./review.validation";

const router = Router();

// Public / User
router.post("/", authMiddleware(), validate(createReviewSchema), createReviewHandler);

router.get("/product/:productId", getProductReviewsHandler); // không cần auth, chỉ lấy review đã duyệt

// Admin
router.get("/admin/all", authMiddleware(), requireRole("ADMIN"), getAllReviewsAdminHandler);

router.patch("/admin/:id", authMiddleware(), requireRole("ADMIN"), validate(updateReviewAdminSchema), updateReviewAdminHandler);

router.delete("/admin/:id", authMiddleware(), requireRole("ADMIN"), deleteReviewAdminHandler);

export default router;
