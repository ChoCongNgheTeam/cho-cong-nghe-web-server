import { JwtPayload } from "jsonwebtoken";

export interface AccessTokenPayload extends JwtPayload {
  userId: string;
  role: string;
}
