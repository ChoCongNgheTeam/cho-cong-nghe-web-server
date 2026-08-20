import { env } from "./env";
import ms from "ms";
import crypto from "crypto";

export const jwtConfig = {
  accessToken: {
    secret: env.JWT_SECRET,

    ttl: ms(env.JWT_EXPIRES_IN as ms.StringValue),

    expiresIn: Math.floor(ms(env.JWT_EXPIRES_IN as ms.StringValue) / 1000),
  },
  refreshToken: {
    secret: env.JWT_REFRESH_SECRET,

    ttl: {
      short: ms(env.JWT_REFRESH_TTL_SHORT as ms.StringValue),
      long: ms(env.JWT_REFRESH_TTL_LONG as ms.StringValue),
    },
  },

  resetToken: {
    // Trước đây dùng chung env.JWT_SECRET với access token — cùng 1 secret
    // cho 2 loại token khác mục đích là 1 anti-pattern (nếu secret lộ, cả 2
    // đều mất; và làm giảm phòng thủ theo chiều sâu). Derive 1 secret riêng
    // bằng HMAC-SHA256 từ JWT_SECRET + 1 domain string cố định, để không bắt
    // buộc phải thêm biến môi trường mới cho các deployment đã có sẵn, nhưng
    // vẫn là 1 secret khác biệt về mặt mật mã học so với accessToken.secret.
    secret: crypto.createHmac("sha256", env.JWT_SECRET).update("password-reset-token").digest("hex"),

    ttl: env.RESET_TOKEN_EXPIRES_IN,
    expiresIn: Math.floor(env.RESET_TOKEN_EXPIRES_IN / 1000),
  },
};
