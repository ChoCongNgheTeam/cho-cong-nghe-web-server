import { Router } from "express";
import { asyncHandler } from "@/utils/async-handler";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import { setCategoryAttributesSchema } from "./category-variant-attribute.validation";
import { getAllCategoriesWithAttributesHandler, getAttributeOptionsHandler, getCategoryAttributesHandler, updateCategoryAttributesHandler } from "./category-variant-attribute.controller";
import { requireRole } from "@/app/middlewares/role.middleware";

const router = Router();

// Tất cả routes yêu cầu ADMIN
const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// GET /category-variant-attributes              → list tất cả categories + attributes
router.get("/", ...adminAuth, asyncHandler(getAllCategoriesWithAttributesHandler));

// GET /category-variant-attributes/attributes   → list attributes để FE render gợi ý
router.get("/attributes", ...adminAuth, asyncHandler(getAttributeOptionsHandler));

// GET /category-variant-attributes/:categoryId  → chi tiết 1 category
router.get("/:categoryId", ...adminAuth, asyncHandler(getCategoryAttributesHandler));

// PUT /category-variant-attributes/:categoryId  → set attributes cho category
router.put("/:categoryId", ...adminAuth, validate(setCategoryAttributesSchema), asyncHandler(updateCategoryAttributesHandler));

export default router;
