import { Router } from "express";
import { optionalAuthMiddleware, authMiddleware } from "@/app/middlewares/auth.middleware";
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
  getCartLimiter,
} from "../../../utils/rateLimiter";

const router = Router();

// 1. Rate Limiter: Áp dụng cho toàn bộ router (An toàn)
router.use(generalCartLimiter);

// ==========================================
// A. PUBLIC / GUEST ROUTES (Không bắt buộc Login)
// ==========================================

// 1. Validate Item:
// Route này hoàn toàn không cần biết user là ai, chỉ check logic sản phẩm
// Nên KHÔNG gắn optionalAuthMiddleware để tránh rủi ro 401
router.post(
  "/validate-item",
  addToCartLimiter,
  validate(validateItemSchema, "body"),
  c.validateItemHandler
);

// 2. Lấy Cart (Hybrid):
// Cần optionalAuthMiddleware vì Controller có check: if (req.user) ...
// Nếu middleware này lỗi, chỉ route này bị ảnh hưởng, không chết route validate
router.post(
  "/get",
  optionalAuthMiddleware, // <--- Chỉ áp dụng riêng cho route này
  getCartLimiter,
  validate(validateLocalCartSchema, "body"),
  c.getCartHandler
);

// ==========================================
// B. AUTHENTICATED ROUTES (Bắt buộc Login)
// ==========================================

// Áp dụng authMiddleware cho TẤT CẢ các route bên dưới dòng này.
// Cách này gọn hơn là phải gán vào từng dòng router.post/put/delete.
router.use(authMiddleware); 

// 3. Sync localStorage -> DB
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