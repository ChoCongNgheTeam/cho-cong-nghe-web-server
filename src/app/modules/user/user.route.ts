import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { userUpload } from "@/app/middlewares/upload/upload.config";
import { asyncHandler } from "@/utils/async-handler";
import {
  getMeHandler,
  updateMeHandler,
  changePasswordHandler,
  getMyNotifPreferencesHandler,
  updateMyNotifPreferencesHandler,
  getUsersHandler,
  getUserByIdHandler,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
  restoreUserHandler,
  hardDeleteUserHandler,
  getDeletedUsersHandler,
  exportUsersAdminHandler,
} from "./user.controller";
import { createUserSchema, changePasswordSchema, getUsersQuerySchema, exportUsersSchema, updateNotifPreferencesSchema, getDeletedUsersQuerySchema } from "./user.validation";
import { STAFF_ROLES } from "@/app/modules/staff-permissions/staff-permissions.types";

const router = Router();

const staffAdminAuth = [authMiddleware(), requireRole(...STAFF_ROLES, "ADMIN")] as const;
const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// Chống brute-force đổi mật khẩu: tối đa 5 lần / 15 phút / IP
const changePasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Quá nhiều lần thử đổi mật khẩu, vui lòng thử lại sau 15 phút" },
});

// Chống spam upload avatar: tối đa 20 lần / 15 phút / IP
const uploadAvatarLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Quá nhiều lần upload, vui lòng thử lại sau" },
});

// SELF — STATIC

router.get("/me", authMiddleware(), asyncHandler(getMeHandler));

// Gắn userUpload để hỗ trợ upload avatar
// Không validate body ở middleware vì body là multipart — controller tự parse + validate
router.patch("/me", authMiddleware(), uploadAvatarLimiter, userUpload.single("avatarImage"), asyncHandler(updateMeHandler));

router.patch("/me/change-password", authMiddleware(), changePasswordLimiter, validate(changePasswordSchema, "body"), asyncHandler(changePasswordHandler));

router.get("/me/notification-preferences", authMiddleware(), asyncHandler(getMyNotifPreferencesHandler));
router.patch("/me/notification-preferences", authMiddleware(), validate(updateNotifPreferencesSchema, "body"), asyncHandler(updateMyNotifPreferencesHandler));

// ADMIN — STATIC

router.get("/admin", ...staffAdminAuth, validate(getUsersQuerySchema, "query"), asyncHandler(getUsersHandler));
router.post("/admin", ...adminAuth, validate(createUserSchema, "body"), asyncHandler(createUserHandler));
router.get("/admin/trash", ...adminAuth, validate(getDeletedUsersQuerySchema, "query"), asyncHandler(getDeletedUsersHandler));

router.get("/admin/export", ...staffAdminAuth, validate(exportUsersSchema, "query"), asyncHandler(exportUsersAdminHandler));

// ADMIN — PARAM + SUFFIX

router.post("/admin/:id/restore", ...adminAuth, asyncHandler(restoreUserHandler));
router.delete("/admin/:id/permanent", ...adminAuth, asyncHandler(hardDeleteUserHandler));

// ADMIN — PARAM ONLY

router.get("/admin/:id", ...staffAdminAuth, asyncHandler(getUserByIdHandler));

// Gắn userUpload để hỗ trợ upload avatar từ admin
// Không validate body ở middleware — controller tự gọi parseMultipartData + updateUserSchema.parse
router.patch("/admin/:id", ...adminAuth, uploadAvatarLimiter, userUpload.single("avatarImage"), asyncHandler(updateUserHandler));

router.delete("/admin/:id", ...staffAdminAuth, asyncHandler(deleteUserHandler));

export default router;
