import "dotenv/config";

export const env = {
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  RESET_TOKEN_EXPIRES_IN: Number(process.env.RESET_TOKEN_EXPIRES_IN || 60 * 60 * 1000),
};
