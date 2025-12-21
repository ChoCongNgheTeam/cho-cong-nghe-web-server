import { env } from "./env";

export const jwtConfig = {
  secret: env.JWT_SECRET,
  expiresIn: env.JWT_EXPIRES_IN as string,
  resetTokenExpiresIn: env.RESET_TOKEN_EXPIRES_IN,
};
