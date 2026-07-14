import { Router } from "express";
import { asyncHandler } from "@/utils/async-handler";
import { healthCheckHandler, healthCheckDetailedHandler } from "./health.controller";

const router = Router();

// Không gắn authMiddleware — endpoint này phải public để cron/uptime service ngoài gọi được
router.get("/", healthCheckHandler);
router.get("/detailed", asyncHandler(healthCheckDetailedHandler));

export default router;
