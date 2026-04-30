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
import { STAFF_ROLES } from "@/app/modules/staff-permissions/staff-permissions.types";

const router = Router();
const adminOnly = [authMiddleware(), requireRole("ADMIN")] as const;
// Mọi staff đều có thể xem session/login history của chính mình
const staffAdmin = [authMiddleware(), requireRole(...STAFF_ROLES, "ADMIN")] as const;

// Admin only
router.get("/logs", ...adminOnly, validate(listAuditLogsSchema, "query"), asyncHandler(getAuditLogsHandler));
router.get("/login-history", ...adminOnly, validate(listLoginHistorySchema, "query"), asyncHandler(getLoginHistoryHandler));
router.get("/anomalies", ...adminOnly, asyncHandler(getAnomaliesHandler));

// Staff & Admin — chỉ data của chính mình, không cần permission cụ thể
router.get("/login-history/me", ...staffAdmin, asyncHandler(getMyLoginHistoryHandler));
router.get("/sessions", ...staffAdmin, asyncHandler(getActiveSessionsHandler));
router.delete("/sessions", ...staffAdmin, asyncHandler(revokeAllSessionsHandler));
router.delete("/sessions/:tokenId", ...staffAdmin, asyncHandler(revokeSessionHandler));

export default router;
