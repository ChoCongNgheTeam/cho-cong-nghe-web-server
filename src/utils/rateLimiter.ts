import rateLimit from "express-rate-limit";

// Trước đây có 2 cơ chế rate-limit riêng biệt cùng áp dụng cho /forgot-password
// (forgotPasswordRateLimit dùng Map in-memory + forgotPasswordLimiter dùng
// express-rate-limit) — thừa và không nhất quán, đồng thời Map in-memory
// không tự dọn key cũ theo IP nên rò rỉ bộ nhớ dần theo thời gian chạy. Đã
// gộp về DUY NHẤT express-rate-limit (forgotPasswordLimiter bên dưới), xem
// auth.route.ts. Nếu cần rate-limit theo email thay vì theo IP, cân nhắc bổ
// sung keyGenerator riêng thay vì tự cài thêm 1 cơ chế mới.
//
// Lưu ý khi scale nhiều instance: express-rate-limit mặc định lưu counter
// trong bộ nhớ của TỪNG instance — nếu chạy nhiều instance phía sau load
// balancer, giới hạn thực tế sẽ nhân lên theo số instance. Khi đó cần
// store dùng chung (VD: rate-limit-redis với client redis đã có sẵn ở
// @/config/redis) để giới hạn đúng trên toàn cụm.

export const refreshTokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10, // 10 lần / IP / 15 phút
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 8, // 8 lần / IP / 15 phút — siết lại để chống brute-force (trước đây max:50, quá lỏng)
  standardHeaders: true,
  legacyHeaders: false,
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
});

export const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // chống spam tạo tài khoản / dò email trùng
  standardHeaders: true,
  legacyHeaders: false,
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
