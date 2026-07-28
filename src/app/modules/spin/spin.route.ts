import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { getPrizesAdminHandler, getPrizeDetailHandler, createPrizeHandler, updatePrizeHandler, deletePrizeHandler, getSpinStatsHandler, resetSpinDataHandler, getSpinStatusHandler, spinHandler } from "./spin.controller";
import { prizeParamsSchema, createPrizeSchema, updatePrizeSchema } from "./spin.validation";

const router = Router();

const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// ── Admin — quản lý phần thưởng (mount ở /admin/spin-prizes) ─────────────────
router.get("/admin/spin-prizes", ...adminAuth, asyncHandler(getPrizesAdminHandler));
router.post("/admin/spin-prizes", ...adminAuth, validate(createPrizeSchema, "body"), asyncHandler(createPrizeHandler));

// Đặt trước /:id vì "stats"/"reset" nếu để sau sẽ bị route /:id nuốt mất (Express khớp theo thứ tự đăng ký)
router.get("/admin/spin-prizes/stats", ...adminAuth, asyncHandler(getSpinStatsHandler));
router.post("/admin/spin-prizes/reset", ...adminAuth, asyncHandler(resetSpinDataHandler));

router.get("/admin/spin-prizes/:id", ...adminAuth, validate(prizeParamsSchema, "params"), asyncHandler(getPrizeDetailHandler));
router.patch("/admin/spin-prizes/:id", ...adminAuth, validate(prizeParamsSchema, "params"), validate(updatePrizeSchema, "body"), asyncHandler(updatePrizeHandler));
router.delete("/admin/spin-prizes/:id", ...adminAuth, validate(prizeParamsSchema, "params"), asyncHandler(deletePrizeHandler));

// ── Public — khách đã đăng nhập (mount ở /spin) ──────────────────────────────
router.get("/spin/status", authMiddleware(), asyncHandler(getSpinStatusHandler));
router.post("/spin", authMiddleware(), asyncHandler(spinHandler));

export default router;
