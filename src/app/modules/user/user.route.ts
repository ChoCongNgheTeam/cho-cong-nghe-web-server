import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { asyncHandler } from "@/utils/async-handler";
import {
  getMeHandler,
  updateMeHandler,
  changePasswordHandler,
  getUsersHandler,
  getUserByIdHandler,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
  restoreUserHandler,
  hardDeleteUserHandler,
  getDeletedUsersHandler,
} from "./user.controller";
import { createUserSchema, updateUserSchema, updateProfileSchema, changePasswordSchema } from "./user.validation";

const router = Router();

router.get("/me", authMiddleware(true), asyncHandler(getMeHandler));

router.patch("/me", authMiddleware(true), validate(updateProfileSchema), asyncHandler(updateMeHandler));

router.patch("/me/change-password", authMiddleware(true), validate(changePasswordSchema), asyncHandler(changePasswordHandler));

//  Staff & Admin: xem danh sách / chi tiết / soft delete

router.get("/admin", authMiddleware(true), requireRole("STAFF", "ADMIN"), asyncHandler(getUsersHandler));

router.get("/admin/:id", authMiddleware(true), requireRole("STAFF", "ADMIN"), asyncHandler(getUserByIdHandler));

//   Staff → chỉ xóa được CUSTOMER (guard trong controller)
//   Admin → xóa mọi role (trừ chính mình — guard trong service)
router.delete("/admin/:id", authMiddleware(true), requireRole("STAFF", "ADMIN"), asyncHandler(deleteUserHandler));

// Admin only

router.post("/admin", authMiddleware(true), requireRole("ADMIN"), validate(createUserSchema), asyncHandler(createUserHandler));

router.patch("/admin/:id", authMiddleware(true), requireRole("ADMIN"), validate(updateUserSchema), asyncHandler(updateUserHandler));

// Khôi phục từ trash
router.post("/admin/:id/restore", authMiddleware(true), requireRole("ADMIN"), asyncHandler(restoreUserHandler));

// Hard delete (chỉ sau khi đã soft delete)
router.delete("/admin/:id/permanent", authMiddleware(true), requireRole("ADMIN"), asyncHandler(hardDeleteUserHandler));

// Danh sách user trong trash
router.get("/admin/trash/users", authMiddleware(true), requireRole("ADMIN"), asyncHandler(getDeletedUsersHandler));

export default router;
