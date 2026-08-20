import { CookieOptions } from "express";

export const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

// Cookie ngắn hạn giữ nonce chống CSRF cho luồng OAuth (Facebook). "lax" là đủ
// và đúng dùng cho case này: cookie Lax vẫn được gửi kèm khi provider redirect
// top-level GET về callback của chúng ta, nên không cần "none".
export const OAUTH_STATE_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 10 * 60 * 1000, // 10 phút, đủ cho user thao tác trên Facebook
};
