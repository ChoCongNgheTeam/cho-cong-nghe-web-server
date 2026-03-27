import { Router } from "express";
import { asyncHandler } from "@/utils/async-handler";
import { searchHandler } from "./search.controller";

const router = Router();
router.get("/", asyncHandler(searchHandler));
export default router;
