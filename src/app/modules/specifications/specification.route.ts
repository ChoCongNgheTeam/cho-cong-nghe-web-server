import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { asyncHandler } from "@/utils/async-handler";
import {
  getSpecificationsActiveHandler,
  getSpecificationsAdminHandler,
  getSpecificationDetailHandler,
  createSpecificationHandler,
  updateSpecificationHandler,
  toggleSpecificationActiveHandler,
} from "./specification.controller";

const router = Router();
const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// Public
router.get("/", asyncHandler(getSpecificationsActiveHandler));

// Admin
router.get("/admin/all", ...adminAuth, asyncHandler(getSpecificationsAdminHandler));
router.post("/admin", ...adminAuth, asyncHandler(createSpecificationHandler));
router.get("/admin/:id", ...adminAuth, asyncHandler(getSpecificationDetailHandler));
router.patch("/admin/:id", ...adminAuth, asyncHandler(updateSpecificationHandler));
router.patch("/admin/:id/toggle", ...adminAuth, asyncHandler(toggleSpecificationActiveHandler));

export default router;
