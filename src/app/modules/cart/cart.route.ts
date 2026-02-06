import { Router } from "express";
import { optionalAuthMiddleware } from "@/app/middlewares/auth.middleware"; // Hoặc authMiddleware bắt buộc cho các route write
import { validate } from "@/app/middlewares/validate.middleware";
import * as c from "./cart.controller";
import {
  addToCartSchema,
  updateCartItemSchema,
  cartItemParamsSchema,
  validateItemSchema,
  syncCartSchema,
  validateLocalCartSchema,
} from "./cart.validation";
import {
  addToCartLimiter,
  generalCartLimiter,
} from "./cart.rate-limit";

const router = Router();

// Middleware auth (Tùy logic app, ở đây dùng optional để getCart handle cả 2 case)
router.use(optionalAuthMiddleware);
router.use(generalCartLimiter);

// --- Public / Guest Routes (Validation Only) ---

// 1. Validate 1 item (Guest dùng khi click Add to cart để check tồn kho)
router.post(
  "/validate-item",
  validate(validateItemSchema, "body"),
  c.validateItemHandler
);

// 2. Lấy Cart (User: DB, Guest: Validate list gửi lên từ body)
// Note: Guest phải dùng POST thay vì GET vì cần gửi body items lớn
router.post(
  "/get",
  validate(validateLocalCartSchema, "body"), // Validate array input
  c.getCartHandler
);

// --- Authenticated Routes (Write to DB) ---

// 3. Sync localStorage -> DB (Gọi khi login)
router.post(
  "/sync",
  validate(syncCartSchema, "body"),
  c.syncCartHandler
);

// 4. Thêm item vào DB
router.post(
  "/",
  addToCartLimiter,
  validate(addToCartSchema, "body"),
  c.addToCartHandler
);

// 5. Update item
router.put(
  "/:cartItemId",
  validate(cartItemParamsSchema, "params"),
  validate(updateCartItemSchema, "body"),
  c.updateCartItemHandler
);

// 6. Delete item
router.delete(
  "/:cartItemId",
  validate(cartItemParamsSchema, "params"),
  c.removeFromCartHandler
);

// 7. Clear all
router.delete("/", c.clearCartHandler);

export default router;