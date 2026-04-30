import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { staffPermissionsSelect, StaffPermissionsData } from "./staff-permissions.types";

// ── Queries ────────────────────────────────────────────────────────────────

export const findByUserId = async (userId: string) => {
  return prisma.staff_permissions.findUnique({
    where: { userId },
    select: staffPermissionsSelect,
  });
};

// Lấy permissions kèm thông tin user — dùng cho admin list
export const findAllWithUser = async () => {
  return prisma.staff_permissions.findMany({
    select: {
      ...staffPermissionsSelect,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          avatarImage: true,
          isActive: true,
        },
      },
    },
    orderBy: { user: { role: "asc" } },
  });
};

// ── Mutations ──────────────────────────────────────────────────────────────

export const createPermissions = async (userId: string, data: Omit<StaffPermissionsData, "userId" | "updatedAt">) => {
  return prisma.staff_permissions.create({
    data: { userId, ...data },
    select: staffPermissionsSelect,
  });
};

export const upsertPermissions = async (userId: string, data: Omit<StaffPermissionsData, "userId" | "updatedAt">) => {
  return prisma.staff_permissions.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
    select: staffPermissionsSelect,
  });
};

export const updatePermissions = async (userId: string, data: Prisma.staff_permissionsUpdateInput) => {
  return prisma.staff_permissions.update({
    where: { userId },
    data,
    select: staffPermissionsSelect,
  });
};

export const deletePermissions = async (userId: string) => {
  return prisma.staff_permissions.delete({ where: { userId } });
};
