import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { getPageBySlugHandler } from "./page.controller";
import { pageSlugParamsSchema } from "./page.validation";

const router = Router();

// Public route: Dùng chung cho mọi trang tĩnh dựa theo slug
router.get(
  "/:slug",
  validate(pageSlugParamsSchema, "params"),
  asyncHandler(getPageBySlugHandler)
);

export default router;