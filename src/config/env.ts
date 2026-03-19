import "dotenv/config";

export const env = {
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN as string,

  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,

  JWT_REFRESH_TTL_SHORT: process.env.JWT_REFRESH_TTL_SHORT || "1d",
  JWT_REFRESH_TTL_LONG: process.env.JWT_REFRESH_TTL_LONG || "7d",

  RESET_TOKEN_EXPIRES_IN: Number(process.env.RESET_TOKEN_EXPIRES_IN || 3600000),

  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
};
