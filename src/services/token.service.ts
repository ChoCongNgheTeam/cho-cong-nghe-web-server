import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { jwtConfig } from "@/config/jwt";
import { AccessTokenPayload } from "@/types/jwt";

export const signAccessToken = (payload: { userId: string; role: string }) => {
  return jwt.sign(payload, jwtConfig.accessToken.secret as Secret, {
    expiresIn: jwtConfig.accessToken.expiresIn as SignOptions["expiresIn"],
  });
};

export const signRefreshToken = (payload: { userId: string }, refreshTokenTTL: number) => {
  return jwt.sign(payload, jwtConfig.refreshToken.secret as Secret, {
    expiresIn: Math.floor(refreshTokenTTL / 1000), // ms → seconds
  });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, jwtConfig.accessToken.secret as Secret) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, jwtConfig.refreshToken.secret as Secret);
};
