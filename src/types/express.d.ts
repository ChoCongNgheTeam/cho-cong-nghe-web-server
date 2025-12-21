import { UserRole } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string; // "ADMIN" | "STAFF" | "CUSTOMER"
      };
    }
  }
}

export {};
