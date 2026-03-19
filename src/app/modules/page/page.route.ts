import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { asyncHandler } from "@/utils/async-handler";
import * as controller from "./page.controller";
import * as validator from "./page.validation";

const router = Router();

// Định nghĩa phân quyền
// Giả sử hàm requireRole của bạn hỗ trợ truyền nhiều Role: requireRole("ADMIN", "STAFF")
const staffAuth = [authMiddleware(), requireRole("ADMIN", "STAFF")] as const;
const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// ======= ROUTES PUBLIC (Không cần đăng nhập) =======
router.get("/", validate(validator.listPagesQuerySchema, "query"), asyncHandler(controller.getPagesPublicHandler));
router.get("/:slug", validate(validator.pageSlugParamsSchema, "params"), asyncHandler(controller.getPageBySlugHandler));

// ======= ROUTES ADMIN / STAFF (Làm việc với bảng chính) =======
// Lấy danh sách (STAFF)
router.get("/admin/all", ...staffAuth, validate(validator.adminListPagesQuerySchema, "query"), asyncHandler(controller.getPagesAdminHandler));

// Thùng rác (CHỈ ADMIN) -> Đặt trước :id
router.get("/admin/trash", ...adminAuth, validate(validator.adminListPagesQuerySchema, "query"), asyncHandler(controller.getTrashAdminHandler));

// Thêm mới (STAFF)
router.post("/admin", ...staffAuth, validate(validator.createPageSchema, "body"), asyncHandler(controller.createPageHandler));

// Đổi trạng thái nhanh (STAFF) -> Đặt trước :id
router.patch("/admin/:id/status", ...staffAuth, validate(validator.pageIdParamsSchema, "params"), validate(validator.changeStatusSchema, "body"), asyncHandler(controller.changePageStatusHandler));

// Thao tác Thùng rác (CHỈ ADMIN) -> Đặt trước :id
router.patch("/admin/:id/restore", ...adminAuth, validate(validator.pageIdParamsSchema, "params"), asyncHandler(controller.restorePageHandler));
router.delete("/admin/:id/hard-delete", ...adminAuth, validate(validator.pageIdParamsSchema, "params"), asyncHandler(controller.hardDeletePageHandler));

// C.R.U.D Cơ bản trên 1 ID (STAFF) -> Đặt DƯỚI CÙNG
router.get("/admin/:id", ...staffAuth, validate(validator.pageIdParamsSchema, "params"), asyncHandler(controller.getPageDetailAdminHandler));
router.patch("/admin/:id", ...staffAuth, validate(validator.pageIdParamsSchema, "params"), validate(validator.updatePageSchema, "body"), asyncHandler(controller.updatePageHandler));
router.delete("/admin/:id", ...staffAuth, validate(validator.pageIdParamsSchema, "params"), asyncHandler(controller.deletePageHandler)); // Đây là Xóa mềm

export default router;