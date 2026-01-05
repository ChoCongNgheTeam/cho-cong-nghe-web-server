import { env } from "./env";
import ms from "ms";

export const jwtConfig = {
  accessToken: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN as string,
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
    expiresIn: env.RESET_TOKEN_EXPIRES_IN,
  },
};
