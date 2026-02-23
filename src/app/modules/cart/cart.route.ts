import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import * as c from "./cart.controller";
import { 
  addToCartSchema, 
  updateCartItemSchema, 
  cartItemParamsSchema, 
  validateItemSchema, 
  syncCartSchema 
} from "./cart.validation";
import { addToCartLimiter, generalCartLimiter, getCartLimiter } from "../../../utils/rateLimiter";

const router = Router();

// 1. Rate Limiter: Áp dụng cho toàn bộ router
router.use(generalCartLimiter);

// ==========================================
// A. PUBLIC / GUEST ROUTES (Không bắt buộc Login)
// ==========================================

// 1. Validate Item: Cho phép FE gọi Debounce để check nhanh tồn kho khi user thay đổi số lượng lớn
router.post("/validate-item", addToCartLimiter, validate(validateItemSchema, "body"), c.validateItemHandler);

// ==========================================
// B. AUTHENTICATED ROUTES (Bắt buộc Login)
// ==========================================

// Áp dụng authMiddleware(true) cho TẤT CẢ các route bên dưới
router.use(authMiddleware(true));

// 2. Lấy Cart (Chỉ User)
router.get("/", getCartLimiter, c.getCartHandler);

// 3. Sync localStorage -> DB (Gọi khi vừa Login)
router.post("/sync", validate(syncCartSchema, "body"), c.syncCartHandler);

// 4. Thêm item vào DB
router.post("/", addToCartLimiter, validate(addToCartSchema, "body"), c.addToCartHandler);

// 5. Update item
router.put("/:cartItemId", validate(cartItemParamsSchema, "params"), validate(updateCartItemSchema, "body"), c.updateCartItemHandler);

// 6. Delete item
router.delete("/:cartItemId", validate(cartItemParamsSchema, "params"), c.removeFromCartHandler);

// 7. Clear all
router.delete("/", c.clearCartHandler);

export default router;