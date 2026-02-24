import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import {
  getMyOrdersHandler,
  getOrderDetailHandler,
  createOrderHandler,
  getAllOrdersAdminHandler,
  getOrderAdminDetailHandler,
  updateOrderAdminHandler,
  deleteOrderAdminHandler,
} from "./order.controller";
import { createOrderSchema, updateOrderAdminSchema } from "./order.validation";

const router = Router();

// public
router.get("/my", authMiddleware(), getMyOrdersHandler);

router.get("/my/:id", authMiddleware(), getOrderDetailHandler);

router.post("/", authMiddleware(), validate(createOrderSchema), createOrderHandler);

// admin
router.get("/admin/all", authMiddleware(), requireRole("ADMIN"), getAllOrdersAdminHandler);

router.get("/admin/:id", authMiddleware(), requireRole("ADMIN"), getOrderAdminDetailHandler);

router.patch(
  "/admin/:id",
  authMiddleware(),
  requireRole("ADMIN"),
  validate(updateOrderAdminSchema),
  updateOrderAdminHandler
);

router.delete("/admin/:id", authMiddleware(), requireRole("ADMIN"), deleteOrderAdminHandler);

export default router;
