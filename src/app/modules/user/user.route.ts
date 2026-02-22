import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { getUsersHandler, getUserByIdHandler, createUserHandler, updateUserHandler, deleteUserHandler, getMeHandler, updateMeHandler } from "./user.controller";
import { createUserSchema, updateUserSchema, updateProfileSchema } from "./user.validation";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { asyncHandler } from "@/utils/async-handler";

const router = Router();

// Authenticated user
router.get("/me", authMiddleware(true), asyncHandler(getMeHandler));
router.patch("/me", authMiddleware(true), validate(updateProfileSchema), asyncHandler(updateMeHandler));

// Admin only
router.get("/", authMiddleware(true), requireRole("ADMIN"), asyncHandler(getUsersHandler));
router.get("/:id", authMiddleware(true), requireRole("ADMIN"), asyncHandler(getUserByIdHandler));
router.post("/", authMiddleware(true), requireRole("ADMIN"), validate(createUserSchema), asyncHandler(createUserHandler));
router.patch("/:id", authMiddleware(true), requireRole("ADMIN"), validate(updateUserSchema), asyncHandler(updateUserHandler));
router.delete("/:id", authMiddleware(true), requireRole("ADMIN"), asyncHandler(deleteUserHandler));

export default router;
