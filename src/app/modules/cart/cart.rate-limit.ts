import rateLimit from "express-rate-limit";
import { Request } from "express";
import { ipKeyGenerator } from "express-rate-limit";

/**
 * Tạo key duy nhất cho mỗi user/session
 * Ưu tiên: userId > sessionId > IP
 */
const createRateLimitKey = (req: Request): string => {
  if (req.user?.id) return `user:${req.user.id}`;

  // chuẩn hóa IPv6 an toàn theo express-rate-limit
  return `ip:${ipKeyGenerator(req)}`;
};


/**
 * Kiểm tra xem có nên bỏ qua rate limit không
 * Admin và Manager được miễn giới hạn
 */
const shouldSkipRateLimit = (req: Request): boolean => {
  return req.user?.role === "admin" || req.user?.role === "manager";
};

/**
 * Tạo error response khi vượt giới hạn
 */
const createRateLimitResponse = (message: string, retryAfter: number) => ({
  success: false,
  message,
  retryAfter,
});

/**
 * Config chung cho tất cả rate limiters
 */
const baseConfig = {
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: createRateLimitKey,
  skip: shouldSkipRateLimit,
};

/**
 * Rate limiter cho GET cart
 * 30 requests/phút - Cho phép reload nhiều lần
 */
export const getCartLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 1000,
  max: 30,
  message: createRateLimitResponse(
    "Bạn đang tải giỏ hàng quá nhiều lần. Vui lòng đợi trong giây lát.",
    60
  ),
});

/**
 * Rate limiter cho ADD to cart
 * 10 requests/phút - Chống spam thêm sản phẩm
 */
export const addToCartLimiter = rateLimit({
  ...baseConfig,
  windowMs: 30 * 1000,
  max: 10,
  message: createRateLimitResponse(
    "Bạn đã thêm sản phẩm quá nhiều lần. Vui lòng đợi 30 giây và thử lại.",
    30
  ),
});

/**
 * Rate limiter cho UPDATE cart item
 * 20 requests/30s - User có thể spam nút +/-
 */
export const updateCartLimiter = rateLimit({
  ...baseConfig,
  windowMs: 30 * 1000,
  max: 20,
  message: createRateLimitResponse(
    "Bạn cập nhật quá nhanh. Vui lòng đợi trong giây lát.",
    30
  ),
});

/**
 * Rate limiter cho DELETE cart item
 * 15 requests/30s - Xóa nhiều sản phẩm
 */
export const removeCartLimiter = rateLimit({
  ...baseConfig,
  windowMs: 30 * 1000,
  max: 15,
  message: createRateLimitResponse(
    "Bạn xóa sản phẩm quá nhanh. Vui lòng đợi trong giây lát.",
    30
  ),
});

/**
 * Rate limiter tổng quát cho tất cả cart operations
 * 50 requests/phút - Ngăn bot spam tổng thể
 */
export const generalCartLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 1000,
  max: 50,
  message: createRateLimitResponse(
    "Quá nhiều thao tác trên giỏ hàng. Vui lòng thử lại sau.",
    60
  ),
});