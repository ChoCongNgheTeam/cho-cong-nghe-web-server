import { Request } from "express";
import rateLimit from "express-rate-limit";

const requests = new Map<string, number[]>();

const RATE_LIMIT_COUNT = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 phút

export const forgotPasswordRateLimit = (req: Request): void => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();

  const userRequests = requests.get(ip) || [];

  // Xóa các request cũ ngoài window
  const validRequests = userRequests.filter((time) => now - time < RATE_LIMIT_WINDOW_MS);

  if (validRequests.length >= RATE_LIMIT_COUNT) {
    throw new Error("Quá nhiều yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau 15 phút.");
  }

  // Thêm request mới
  validRequests.push(now);
  requests.set(ip, validRequests);
};

export const refreshTokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10, // 10 lần / IP
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
});

export const getCartLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
});

export const addToCartLimiter = rateLimit({
  windowMs: 30 * 1000,
  max: 10,
});

export const updateCartLimiter = rateLimit({
  windowMs: 30 * 1000,
  max: 20,
});

export const removeCartLimiter = rateLimit({
  windowMs: 30 * 1000,
  max: 15,
});

export const generalCartLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
});
