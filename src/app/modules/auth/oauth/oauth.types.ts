import { UserRole } from "@prisma/client";

export type OAuthResolvedUser = {
  id: string;
  email: string;
  userName: string | null;
  fullName: string | null;
  role: UserRole;
  avatarImage: string | null;
  createdAt: Date;
  isActive: boolean;
};
