import { env } from "./env";
import ms from "ms";

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
    secret: env.JWT_SECRET,

    ttl: env.RESET_TOKEN_EXPIRES_IN,
    expiresIn: Math.floor(env.RESET_TOKEN_EXPIRES_IN / 1000),
  },
};
