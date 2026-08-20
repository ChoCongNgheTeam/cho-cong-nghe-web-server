import * as repo from "./staff-permissions.repository";
import { UpdatePermissionsInput, ResetPermissionsInput, ListStaffPermissionsQuery } from "./staff-permissions.validation";
import { DEFAULT_PERMISSIONS, STAFF_ROLES, StaffRole } from "./staff-permissions.types";
import { NotFoundError, BadRequestError } from "@/errors";
import { cacheGetJSON, cacheSetJSON, cacheDelete } from "@/config/redis";

// requirePermission() query bảng này ở HẦU HẾT mọi route admin có check quyền
// → N+1 nếu không cache. TTL ngắn vì cần permission thay đổi có hiệu lực
// nhanh (VD: admin vừa thu hồi quyền của 1 nhân viên), đồng thời invalidate
// chủ động ngay khi có thao tác ghi (update/reset/seed/remove) bên dưới.
const PERMISSION_CACHE_TTL_SECONDS = 90;
const permissionCacheKey = (userId: string) => `staff-permissions:${userId}`;

// HELPERS

/**
 * Đảm bảo user tồn tại và là staff role.
 * Dùng chung cho các operations cần validate trước khi xử lý.
 */
const assertStaffUser = async (userId: string) => {
  const user = await repo.findStaffCandidateById(userId);

  if (!user) throw new NotFoundError("Người dùng");

  if (!STAFF_ROLES.includes(user.role as StaffRole)) {
    throw new BadRequestError("Người dùng này không phải nhân viên (SALES / MARKETING / SUPPORT / ACCOUNTING)");
  }

  return user;
};

// ADMIN

/** Lấy danh sách tất cả staff kèm permissions (có phân trang) — dùng cho trang quản lý admin */
export const getAllStaffPermissions = async (query: ListStaffPermissionsQuery) => {
  const { page, limit } = query;
  const skip = (page - 1) * limit;

  const { data, total } = await repo.findAllWithUser({ skip, take: limit });
  return { data, total, page, limit };
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

  const result = await repo.updatePermissions(userId, input);
  await cacheDelete(permissionCacheKey(userId));
  return result;
};

/**
 * Reset permissions về mặc định theo role.
 * Dùng khi admin muốn hoàn tác override, hoặc khi đổi role của user.
 */
export const resetPermissionsToDefault = async (userId: string, input: ResetPermissionsInput) => {
  await assertStaffUser(userId);

  const preset = DEFAULT_PERMISSIONS[input.role];
  // upsert: tạo mới nếu chưa có, ghi đè nếu đã có
  const result = await repo.upsertPermissions(userId, preset);
  await cacheDelete(permissionCacheKey(userId));
  return result;
};

// INTERNAL — dùng từ module khác

/**
 * Tự động tạo permissions khi tạo user staff mới.
 * Gọi từ user.service.ts sau khi createUser thành công.
 */
export const seedDefaultPermissions = async (userId: string, role: string) => {
  if (!STAFF_ROLES.includes(role as StaffRole)) return; // CUSTOMER / ADMIN không cần

  const preset = DEFAULT_PERMISSIONS[role as StaffRole];
  // upsert để idempotent — không lỗi nếu gọi lại
  const result = await repo.upsertPermissions(userId, preset);
  await cacheDelete(permissionCacheKey(userId));
  return result;
};

/**
 * Xóa permissions khi xóa user (dùng cascade Prisma cũng được,
 * nhưng expose để dùng explicit nếu cần).
 */
export const removePermissions = async (userId: string) => {
  const existing = await repo.findByUserId(userId);
  if (!existing) return; // không có cũng không lỗi
  const result = await repo.deletePermissions(userId);
  await cacheDelete(permissionCacheKey(userId));
  return result;
};

/**
 * Lấy permissions nhẹ — dùng trong auth middleware để check quyền.
 * Không validate user role để tránh thêm query.
 * Có cache (Redis, TTL ngắn) vì hàm này chạy trên gần như mọi request admin.
 */
export const getPermissionsForAuth = async (userId: string) => {
  const key = permissionCacheKey(userId);

  const cached = await cacheGetJSON<Awaited<ReturnType<typeof repo.findByUserId>>>(key);
  if (cached !== null) return cached;

  const perms = await repo.findByUserId(userId);
  if (perms) {
    await cacheSetJSON(key, perms, PERMISSION_CACHE_TTL_SECONDS);
  }
  return perms;
};
