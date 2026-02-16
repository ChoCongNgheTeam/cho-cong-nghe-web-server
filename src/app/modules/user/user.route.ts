import { Router } from "express";
import { validate } from "@/app/middlewares/validate.middleware";
import { getUsersHandler, getUserByIdHandler, createUserHandler, updateUserHandler, deleteUserHandler, getMeHandler, updateMeHandler } from "./user.controller";
import { createUserSchema, updateUserSchema, updateProfileSchema } from "./user.validation";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";

const router = Router();

// Public
router.get("/me", authMiddleware(true), getMeHandler);
router.patch("/me", authMiddleware(true), validate(updateProfileSchema), updateMeHandler);

// Admin only
router.get("/", authMiddleware(true), requireRole("ADMIN"), getUsersHandler);
router.get("/:id", authMiddleware(true), requireRole("ADMIN"), getUserByIdHandler);
router.post("/", authMiddleware(true), requireRole("ADMIN"), validate(createUserSchema), createUserHandler);
router.patch("/:id", authMiddleware(true), requireRole("ADMIN"), validate(updateUserSchema), updateUserHandler);
router.delete("/:id", authMiddleware(true), requireRole("ADMIN"), deleteUserHandler);

export default router;
