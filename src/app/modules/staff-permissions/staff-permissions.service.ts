import * as repo from "./staff-permissions.repository";
import { UpdatePermissionsInput, ResetPermissionsInput } from "./staff-permissions.validation";
import { DEFAULT_PERMISSIONS, STAFF_ROLES, StaffRole } from "./staff-permissions.types";
import { NotFoundError, BadRequestError } from "@/errors";
import prisma from "@/config/db";

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Đảm bảo user tồn tại và là staff role.
 * Dùng chung cho các operations cần validate trước khi xử lý.
 */
const assertStaffUser = async (userId: string) => {
  const user = await prisma.users.findUnique({
    where: { id: userId, deletedAt: null },
    select: { id: true, role: true, fullName: true, email: true },
  });

  if (!user) throw new NotFoundError("Người dùng");

  if (!STAFF_ROLES.includes(user.role as StaffRole)) {
    throw new BadRequestError("Người dùng này không phải nhân viên (SALES / MARKETING / SUPPORT / ACCOUNTING)");
  }

  return user;
};

// ── Admin ──────────────────────────────────────────────────────────────────

/** Lấy danh sách tất cả staff kèm permissions — dùng cho trang quản lý admin */
export const getAllStaffPermissions = async () => {
  return repo.findAllWithUser();
};

/** Lấy permissions của 1 staff */
export const getPermissionsByUserId = async (userId: string) => {
  await assertStaffUser(userId);

  const perms = await repo.findByUserId(userId);
  if (!perms) throw new NotFoundError("Permissions của nhân viên này");

  return perms;
};

/** Admin cập nhật một số permissions của staff (partial update) */
export const updateStaffPermissions = async (userId: string, input: UpdatePermissionsInput) => {
  await assertStaffUser(userId);

  const existing = await repo.findByUserId(userId);
  if (!existing) throw new NotFoundError("Permissions của nhân viên này. Hãy dùng reset để khởi tạo.");

  return repo.updatePermissions(userId, input);
};

/**
 * Reset permissions về mặc định theo role.
 * Dùng khi admin muốn hoàn tác override, hoặc khi đổi role của user.
 */
export const resetPermissionsToDefault = async (userId: string, input: ResetPermissionsInput) => {
  await assertStaffUser(userId);

  const preset = DEFAULT_PERMISSIONS[input.role];
  // upsert: tạo mới nếu chưa có, ghi đè nếu đã có
  return repo.upsertPermissions(userId, preset);
};

// ── Internal — dùng từ module khác ────────────────────────────────────────

/**
 * Tự động tạo permissions khi tạo user staff mới.
 * Gọi từ user.service.ts sau khi createUser thành công.
 */
export const seedDefaultPermissions = async (userId: string, role: string) => {
  const preset = DEFAULT_PERMISSIONS[role];
  if (!preset) return; // CUSTOMER / ADMIN không cần

  // upsert để idempotent — không lỗi nếu gọi lại
  return repo.upsertPermissions(userId, preset);
};

/**
 * Xóa permissions khi xóa user (dùng cascade Prisma cũng được,
 * nhưng expose để dùng explicit nếu cần).
 */
export const removePermissions = async (userId: string) => {
  const existing = await repo.findByUserId(userId);
  if (!existing) return; // không có cũng không lỗi
  return repo.deletePermissions(userId);
};

/**
 * Lấy permissions nhẹ — dùng trong auth middleware để check quyền.
 * Không validate user role để tránh thêm query.
 */
export const getPermissionsForAuth = async (userId: string) => {
  return repo.findByUserId(userId);
};
