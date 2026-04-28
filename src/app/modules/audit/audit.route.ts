import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import {
  getAuditLogsHandler,
  getLoginHistoryHandler,
  getMyLoginHistoryHandler,
  getActiveSessionsHandler,
  revokeSessionHandler,
  revokeAllSessionsHandler,
  getAnomaliesHandler,
} from "./audit.controller";
import { listAuditLogsSchema, listLoginHistorySchema } from "./audit.validation";

const router = Router();
const adminOnly = [authMiddleware(), requireRole("ADMIN")] as const;
const staffAdmin = [authMiddleware(), requireRole("STAFF", "ADMIN")] as const;

// Admin only
router.get("/logs", ...adminOnly, validate(listAuditLogsSchema, "query"), asyncHandler(getAuditLogsHandler));
router.get("/login-history", ...adminOnly, validate(listLoginHistorySchema, "query"), asyncHandler(getLoginHistoryHandler));
router.get("/anomalies", ...adminOnly, asyncHandler(getAnomaliesHandler));

// Staff & Admin (chỉ data của chính mình)
router.get("/login-history/me", ...staffAdmin, asyncHandler(getMyLoginHistoryHandler));
router.get("/sessions", ...staffAdmin, asyncHandler(getActiveSessionsHandler));
router.delete("/sessions", ...staffAdmin, asyncHandler(revokeAllSessionsHandler));
router.delete("/sessions/:tokenId", ...staffAdmin, asyncHandler(revokeSessionHandler));

export default router;
