import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { searchHandler } from "./search.controller";
import { searchQuerySchema } from "./search.validation";

const router = Router();
router.get("/", validate(searchQuerySchema, "query"), asyncHandler(searchHandler));
export default router;
