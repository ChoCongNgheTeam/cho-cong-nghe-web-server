import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { userUpload } from "@/app/middlewares/upload/userUpload";
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
import { createUserSchema, changePasswordSchema, getUsersQuerySchema } from "./user.validation";

const router = Router();

const staffAdminAuth = [authMiddleware(), requireRole("STAFF", "ADMIN")] as const;
const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// ─── Self — static ─────────────────────────────────────────────────────────────

router.get("/me", authMiddleware(), asyncHandler(getMeHandler));

// Gắn userUpload để hỗ trợ upload avatar
// Không validate body ở middleware vì body là multipart — controller tự parse + validate
router.patch("/me", authMiddleware(), userUpload.single("avatarImage"), asyncHandler(updateMeHandler));

router.patch("/me/change-password", authMiddleware(), validate(changePasswordSchema, "body"), asyncHandler(changePasswordHandler));

// ─── Admin — static ───────────────────────────────────────────────────────────

router.get("/admin", ...staffAdminAuth, validate(getUsersQuerySchema, "query"), asyncHandler(getUsersHandler));
router.post("/admin", ...adminAuth, validate(createUserSchema, "body"), asyncHandler(createUserHandler));
router.get("/admin/trash", ...adminAuth, asyncHandler(getDeletedUsersHandler));

// ─── Admin — param + suffix ───────────────────────────────────────────────────

router.post("/admin/:id/restore", ...adminAuth, asyncHandler(restoreUserHandler));
router.delete("/admin/:id/permanent", ...adminAuth, asyncHandler(hardDeleteUserHandler));

// ─── Admin — param only ───────────────────────────────────────────────────────

router.get("/admin/:id", ...staffAdminAuth, asyncHandler(getUserByIdHandler));

// Gắn userUpload để hỗ trợ upload avatar từ admin
// Không validate body ở middleware — controller tự gọi parseMultipartData + updateUserSchema.parse
router.patch("/admin/:id", ...adminAuth, userUpload.single("avatarImage"), asyncHandler(updateUserHandler));

router.delete("/admin/:id", ...staffAdminAuth, asyncHandler(deleteUserHandler));

export default router;
