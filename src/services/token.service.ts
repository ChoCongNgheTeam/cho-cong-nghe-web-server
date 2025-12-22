import jwt, { SignOptions } from "jsonwebtoken";
import { jwtConfig } from "src/config/jwt";

export interface AccessTokenPayload {
  userId: string;
  role: string;
}

export const signAccessToken = (payload: AccessTokenPayload): string => {
  const options: SignOptions = {
    expiresIn: jwtConfig.expiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, jwtConfig.secret, options);
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, jwtConfig.secret) as AccessTokenPayload;
};
