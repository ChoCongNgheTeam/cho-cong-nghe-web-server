import { Router } from "express";
import { validate } from "@/middlewares/validate.middleware";
import {
  getUsersHandler,
  getUserByIdHandler,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
  getMeHandler,
  updateMeHandler,
} from "./user.controller";
import { createUserSchema, updateUserSchema, updateProfileSchema } from "./user.validation";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { requireRole } from "@/middlewares/role.middleware";

const router = Router();

// Public
router.get("/me", authMiddleware, getMeHandler);
router.patch("/me", authMiddleware, validate(updateProfileSchema), updateMeHandler);
router.get("/:id", authMiddleware, getUserByIdHandler);

// Admin only
router.get("/", authMiddleware, requireRole("ADMIN"), getUsersHandler);
router.post(
  "/",
  authMiddleware,
  requireRole("ADMIN"),
  validate(createUserSchema),
  createUserHandler
);
router.patch(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validate(updateUserSchema),
  updateUserHandler
);
router.delete("/:id", authMiddleware, requireRole("ADMIN"), deleteUserHandler);

export default router;
