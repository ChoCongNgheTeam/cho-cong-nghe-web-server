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
import { createUserSchema, updateUserSchema, updateProfileSchema, changePasswordSchema, getUsersQuerySchema } from "./user.validation";

const router = Router();

const staffAdminAuth = [authMiddleware(), requireRole("STAFF", "ADMIN")] as const;
const adminAuth = [authMiddleware(), requireRole("ADMIN")] as const;

// Self — static
router.get("/me", authMiddleware(), asyncHandler(getMeHandler));
router.patch("/me", authMiddleware(), validate(updateProfileSchema, "body"), asyncHandler(updateMeHandler));
router.patch("/me/change-password", authMiddleware(), validate(changePasswordSchema, "body"), asyncHandler(changePasswordHandler));

// Admin — static
router.get("/admin", ...staffAdminAuth, validate(getUsersQuerySchema, "query"), asyncHandler(getUsersHandler));
router.post("/admin", ...adminAuth, validate(createUserSchema, "body"), asyncHandler(createUserHandler));
router.get("/admin/trash", ...adminAuth, asyncHandler(getDeletedUsersHandler));

// Admin — param + suffix
router.post("/admin/:id/restore", ...adminAuth, asyncHandler(restoreUserHandler));
router.delete("/admin/:id/permanent", ...adminAuth, asyncHandler(hardDeleteUserHandler));

// Admin — param only
router.get("/admin/:id", ...staffAdminAuth, asyncHandler(getUserByIdHandler));
router.patch("/admin/:id", ...adminAuth, validate(updateUserSchema, "body"), asyncHandler(updateUserHandler));
router.delete("/admin/:id", ...staffAdminAuth, asyncHandler(deleteUserHandler));

export default router;
