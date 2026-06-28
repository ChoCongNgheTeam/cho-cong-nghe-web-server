import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { getHomePageHandler, getProductsByDateSectionHandler } from "./home.controller";
import { asyncHandler } from "@/utils/async-handler";
import { saleByDateQuerySchema } from "../product/product.validation";

const router = Router();

router.get("/", authMiddleware(false), asyncHandler(getHomePageHandler));

router.get("/sale-by-date", authMiddleware(false), validate(saleByDateQuerySchema, "query"), asyncHandler(getProductsByDateSectionHandler));

export default router;
