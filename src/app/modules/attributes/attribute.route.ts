import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { asyncHandler } from "@/utils/async-handler";
import {
  getAttributesActiveHandler,
  getAttributesAdminHandler,
  getAttributeDetailHandler,
  createAttributeHandler,
  updateAttributeHandler,
  toggleAttributeActiveHandler,
  createOptionHandler,
  updateOptionHandler,
} from "./attribute.controller";

const router = Router();
const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// Public — ProductForm dùng để load options
router.get("/", asyncHandler(getAttributesActiveHandler));

// Admin
router.get("/admin/all", ...adminAuth, asyncHandler(getAttributesAdminHandler));
router.post("/admin", ...adminAuth, asyncHandler(createAttributeHandler));
router.get("/admin/:id", ...adminAuth, asyncHandler(getAttributeDetailHandler));
router.patch("/admin/:id", ...adminAuth, asyncHandler(updateAttributeHandler));
router.patch("/admin/:id/toggle", ...adminAuth, asyncHandler(toggleAttributeActiveHandler));

// Options (thuộc về attribute)
router.post("/admin/:id/options", ...adminAuth, asyncHandler(createOptionHandler));
router.patch("/admin/:id/options/:optionId", ...adminAuth, asyncHandler(updateOptionHandler));

export default router;
