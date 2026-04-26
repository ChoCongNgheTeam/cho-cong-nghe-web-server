import * as repo from "./voucher.repository";
import {
  CreateVoucherInput,
  UpdateVoucherInput,
  ListVouchersQuery,
  ValidateVoucherInput,
  AssignVoucherToUsersInput,
  BulkDeleteVouchersInput,
  ListVoucherUsagesQuery,
  ListVoucherUsersQuery,
} from "./voucher.validation";
import { transformVoucherCard, transformVoucherDetail, transformUserVoucher, calculateDiscount, hasVoucherStarted, isVoucherExpired } from "./voucher.transformers";
import { VoucherCard, VoucherValidationResult } from "./voucher.types";
import { DiscountType } from "@prisma/client";
import { NotFoundError, BadRequestError } from "@/errors";
import prisma from "prisma/client";

// ── Helpers ───────────────────────────────────────────────────────────────────

const assertVoucherExists = async (id: string, includeDeleted = false) => {
  const voucher = await repo.findById(id, includeDeleted);
  if (!voucher) throw new NotFoundError("Voucher");
  return voucher;
};

type CartItemWithTotal = {
  productId: string;
  categoryId?: string;
  brandId?: string;
  categoryPath?: string[];
  itemTotal?: number;
};

const itemMatchesTarget = (item: CartItemWithTotal, target: { targetType: string; targetId?: string | null }): boolean => {
  if (!target.targetId) return false;
  switch (target.targetType) {
    case "PRODUCT":
      return target.targetId === item.productId;
    case "BRAND":
      return target.targetId === item.brandId;
    case "CATEGORY":
      return item.categoryPath?.includes(target.targetId) || item.categoryId === target.targetId;
    default:
      return false;
  }
};

const computeEligibleTotal = (targets: { targetType: string; targetId?: string | null }[], cartItems: CartItemWithTotal[], orderTotal: number): number => {
  if (!targets || targets.length === 0) return orderTotal;
  if (targets.some((t) => t.targetType === "ALL")) return orderTotal;

  const hasItemTotals = cartItems.some((item) => (item.itemTotal ?? 0) > 0);
  if (!hasItemTotals) return orderTotal;

  return cartItems.filter((item) => targets.some((t) => itemMatchesTarget(item, t))).reduce((sum, item) => sum + (item.itemTotal ?? 0), 0);
};

const checkVoucherTargets = (targets: { targetType: string; targetId?: string | null }[], cartItems: CartItemWithTotal[]): boolean => {
  if (!targets || targets.length === 0) return true;
  if (targets.some((t) => t.targetType === "ALL")) return true;
  return cartItems.some((item) => targets.some((t) => itemMatchesTarget(item, t)));
};

// ── Public reads ──────────────────────────────────────────────────────────────

export const getVouchers = async (query: ListVouchersQuery) => {
  const result = await repo.findAll(query);
  const cartTotal = query.cartTotal ?? 0;

  const transformed = result.data.map(transformVoucherCard);

  const sorted = transformed.sort((a, b) => {
    const scoreA = getVoucherScore(a, cartTotal);
    const scoreB = getVoucherScore(b, cartTotal);

    if (scoreA.group !== scoreB.group) return scoreA.group - scoreB.group;

    const discountDiff = b.discountValue - a.discountValue;
    if (discountDiff !== 0) return discountDiff;

    const minOrderDiff = a.minOrderValue - b.minOrderValue;
    if (minOrderDiff !== 0) return minOrderDiff;

    if (a.endDate && b.endDate) {
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    }
    if (a.endDate) return -1;
    if (b.endDate) return 1;

    return 0;
  });

  return { ...result, data: sorted };
};

const getVoucherScore = (voucher: VoucherCard, cartTotal: number): { group: number } => {
  if (!voucher.isActive || voucher.isExpired) return { group: 4 };

  const meetsMinOrder = cartTotal >= voucher.minOrderValue;
  if (!meetsMinOrder) return { group: 3 };

  if (!voucher.isAvailable) return { group: 3 };

  return { group: 1 };
};

export const getVoucherByCode = async (code: string) => {
  const voucher = await repo.findByCode(code);
  if (!voucher) throw new NotFoundError("Voucher");
  return transformVoucherDetail(voucher);
};

export const getUserVouchers = async (userId: string) => {
  const vouchers = await repo.findUserVouchers(userId);
  return vouchers.map((v) => transformUserVoucher(v, v.userVoucherData));
};

export const getDeletedVouchers = async () => {
  const data = await repo.findDeleted();
  return data.map(transformVoucherCard);
};

export const validateVoucher = async (input: ValidateVoucherInput): Promise<VoucherValidationResult> => {
  const { code, orderTotal, userId, cartItems = [] } = input;

  const voucher = await repo.findByCode(code);
  if (!voucher) return { isValid: false, message: "Mã voucher không tồn tại" };
  if (!voucher.isActive) return { isValid: false, message: "Mã voucher đã bị vô hiệu hóa" };
  if (!hasVoucherStarted(voucher.startDate)) return { isValid: false, message: "Mã voucher chưa có hiệu lực" };
  if (isVoucherExpired(voucher.endDate)) return { isValid: false, message: "Mã voucher đã hết hạn" };
  if (orderTotal < Number(voucher.minOrderValue))
    return {
      isValid: false,
      message: `Đơn hàng tối thiểu ${Number(voucher.minOrderValue).toLocaleString("vi-VN")}đ`,
    };
  if (voucher.maxUses && voucher.usesCount >= voucher.maxUses) return { isValid: false, message: "Mã voucher đã hết lượt sử dụng" };

  if (!checkVoucherTargets(voucher.targets ?? [], cartItems)) {
    return { isValid: false, message: "Voucher không áp dụng cho sản phẩm trong giỏ hàng" };
  }

  if (userId) {
    const userVoucher = await repo.findUserVoucherUsage(userId, voucher.id);
    const isPrivateVoucher = await repo.hasVoucherUsers(voucher.id);

    if (isPrivateVoucher) {
      if (!userVoucher) return { isValid: false, message: "Voucher này không dành cho bạn" };
      if (userVoucher.usedCount >= userVoucher.maxUses) return { isValid: false, message: "Bạn đã hết lượt sử dụng voucher này" };
    } else {
      if (voucher.maxUsesPerUser) {
        const usageCount = await repo.countVoucherUsage(userId, voucher.id);
        if (usageCount >= voucher.maxUsesPerUser) return { isValid: false, message: "Bạn đã hết lượt sử dụng voucher này" };
      }
    }
  }

  const targets = voucher.targets ?? [];
  const eligibleTotal = computeEligibleTotal(targets, cartItems, orderTotal);
  const maxDiscount = voucher.maxDiscountValue ? Number(voucher.maxDiscountValue) : null;
  const discount = calculateDiscount(voucher.discountType as DiscountType, Number(voucher.discountValue), orderTotal, eligibleTotal, maxDiscount);
  return { isValid: true, discount, eligibleTotal, voucher: transformVoucherDetail(voucher) };
};

// ── Admin reads ───────────────────────────────────────────────────────────────

export const getVoucherById = async (id: string) => {
  const voucher = await assertVoucherExists(id);
  return transformVoucherDetail(voucher);
};

// ── Mutates ───────────────────────────────────────────────────────────────────

/**
 * Tạo voucher.
 *
 * Nếu payload có `userIds` → gán người dùng riêng tư ngay trong cùng 1 lần tạo.
 * Repository `create` đã xử lý `userIds` trong Prisma transaction nên
 * không cần gọi thêm `assignToUsers` sau đó — tránh race condition.
 */
export const createVoucher = async (input: CreateVoucherInput & { userIds?: string[] }) => {
  const exists = await repo.checkVoucherCode(input.code);
  if (exists) throw new BadRequestError("Mã voucher đã tồn tại");

  // Validate userIds nếu có
  if (input.userIds && input.userIds.length > 0) {
    const uniqueIds = [...new Set(input.userIds)];
    if (uniqueIds.length !== input.userIds.length) {
      input = { ...input, userIds: uniqueIds };
    }
    // Kiểm tra user tồn tại (optional — có thể bỏ nếu muốn nhanh)
    const userCount = await prisma.users.count({
      where: { id: { in: input.userIds } },
    });
    if (input.userIds && input.userIds.length > 0) {
      const uniqueIds = [...new Set(input.userIds)];

      const userIds = uniqueIds;

      const userCount = await prisma.users.count({
        where: { id: { in: userIds } },
      });

      if (userCount !== userIds.length) {
        throw new BadRequestError("Một hoặc nhiều user không tồn tại");
      }

      input = { ...input, userIds };
    }
  }

  // repo.create đã xử lý userIds bên trong — gán atomically
  const voucher = await repo.create(input);
  return transformVoucherDetail(voucher);
};

export const updateVoucher = async (id: string, input: UpdateVoucherInput) => {
  const existing = await getVoucherById(id);
  if (input.code && input.code !== existing.code) {
    const exists = await repo.checkVoucherCode(input.code, id);
    if (exists) throw new BadRequestError("Mã voucher đã tồn tại");
  }
  const voucher = await repo.update(id, input);
  return transformVoucherDetail(voucher);
};

export const deleteVoucher = async (id: string, deletedBy: string) => {
  await assertVoucherExists(id);
  return repo.softDelete(id, deletedBy);
};

export const bulkDeleteVouchers = async (input: BulkDeleteVouchersInput, deletedBy: string) => {
  return repo.bulkSoftDelete(input.ids, deletedBy);
};

export const restoreVoucher = async (id: string) => {
  const voucher = await assertVoucherExists(id, true);
  if (!voucher.deletedAt) throw new BadRequestError("Voucher chưa bị xoá");

  const codeConflict = await repo.checkVoucherCode(voucher.code, id);
  if (codeConflict) throw new BadRequestError(`Mã "${voucher.code}" đã tồn tại ở voucher khác. Hãy đổi mã trước khi khôi phục.`);

  const restored = await repo.restore(id);
  return transformVoucherDetail(restored);
};

export const hardDeleteVoucher = async (id: string) => {
  const voucher = await assertVoucherExists(id, true);
  if (!voucher.deletedAt) throw new BadRequestError("...");

  const usageCount = await prisma.voucher_usages.count({ where: { voucherId: id } });
  if (usageCount > 0) {
    throw new BadRequestError(`Không thể xóa: voucher đã được sử dụng ${usageCount} lần trong lịch sử đơn hàng`);
  }

  const orderCount = await prisma.orders.count({ where: { voucherId: id } });
  if (orderCount > 0) {
    throw new BadRequestError(`Không thể xóa: voucher đang được áp dụng trong ${orderCount} đơn hàng`);
  }

  return repo.hardDelete(id);
};
// ── Assign ────────────────────────────────────────────────────────────────────

export const assignVoucherToUsers = async (input: AssignVoucherToUsersInput) => {
  await getVoucherById(input.voucherId);
  return repo.assignToUsers(input.voucherId, input.userIds, input.maxUsesPerUser);
};

// ── Usages ────────────────────────────────────────────────────────────────────

export const getVoucherUsages = async (query: ListVoucherUsagesQuery) => {
  return repo.findAllUsages(query);
};

// ── Voucher Users (private) ───────────────────────────────────────────────────

export const getVoucherUsers = async (query: ListVoucherUsersQuery) => {
  return repo.findAllVoucherUsers(query);
};

export const revokeVoucherUser = async (voucherId: string, userId: string) => {
  const assignment = await prisma.voucher_user.findUnique({
    where: { voucherId_userId: { voucherId, userId } },
  });
  if (!assignment) throw new NotFoundError("Assignment không tồn tại");
  return repo.revokeVoucherUser(voucherId, userId);
};
