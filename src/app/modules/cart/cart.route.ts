import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import * as c from "./cart.controller";
import {
  addToCartSchema,
  updateCartItemSchema,
  cartItemParamsSchema,
} from "./cart.validation";

const router = Router();

// Tất cả các route trong Cart đều yêu cầu đăng nhập
router.use(authMiddleware);

/**
 * Lấy giỏ hàng của user hiện tại
 * GET /api/v1/cart
 */
router.get("/", c.getCartHandler);

/**
 * Thêm sản phẩm vào giỏ hàng
 * POST /api/v1/cart
 */
router.post("/", validate(addToCartSchema, "body"), c.addToCartHandler);

/**
 * Xác nhận giỏ hàng trước khi checkout
 * POST /api/v1/cart/validate
 */
router.post("/validate", c.validateCartHandler);

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 * PUT /api/v1/cart/:cartItemId
 */
router.put(
  "/:cartItemId",
  validate(cartItemParamsSchema, "params"),
  validate(updateCartItemSchema, "body"),
  c.updateCartItemHandler
);

/**
 * Xóa sản phẩm khỏi giỏ hàng
 * DELETE /api/v1/cart/:cartItemId
 */
router.delete(
  "/:cartItemId",
  validate(cartItemParamsSchema, "params"),
  c.removeFromCartHandler
);

/**
 * Xóa toàn bộ giỏ hàng
 * DELETE /api/v1/cart
 */
router.delete("/", c.clearCartHandler);

export default router;
