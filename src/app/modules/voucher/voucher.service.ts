import * as repo from "./voucher.repository";
import { CreateVoucherInput, UpdateVoucherInput, ListVouchersQuery, ValidateVoucherInput, AssignVoucherToUsersInput, BulkDeleteVouchersInput } from "./voucher.validation";
import { transformVoucherCard, transformVoucherDetail, transformUserVoucher, calculateDiscount, hasVoucherStarted, isVoucherExpired } from "./voucher.transformers";
import { VoucherCard, VoucherValidationResult } from "./voucher.types";
import { DiscountType } from "@prisma/client";
import { NotFoundError, BadRequestError } from "@/errors";

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
  /** Thành tiền item (unit_price × quantity, sau promotion) */
  itemTotal?: number;
};

/** Kiểm tra 1 item có khớp target không */
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

/**
 * Tính subtotal của các item đủ điều kiện áp voucher.
 * - targets rỗng hoặc có ALL → toàn bộ orderTotal
 * - Ngược lại → cộng itemTotal của các item match target
 * - Nếu FE không gửi itemTotal → fallback về orderTotal (backward-compat)
 */
const computeEligibleTotal = (targets: { targetType: string; targetId?: string | null }[], cartItems: CartItemWithTotal[], orderTotal: number): number => {
  if (!targets || targets.length === 0) return orderTotal;
  if (targets.some((t) => t.targetType === "ALL")) return orderTotal;

  const hasItemTotals = cartItems.some((item) => (item.itemTotal ?? 0) > 0);
  if (!hasItemTotals) return orderTotal; // backward-compat

  return cartItems.filter((item) => targets.some((t) => itemMatchesTarget(item, t))).reduce((sum, item) => sum + (item.itemTotal ?? 0), 0);
};

/** Giỏ hàng có ít nhất 1 item khớp target không */
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

  // Sort theo 4 nhóm
  const sorted = transformed.sort((a, b) => {
    const scoreA = getVoucherScore(a, cartTotal);
    const scoreB = getVoucherScore(b, cartTotal);

    // Nhóm khác nhau → nhóm cao hơn lên trước
    if (scoreA.group !== scoreB.group) {
      return scoreA.group - scoreB.group;
    }

    // Cùng nhóm → sort theo rule phụ
    // 1. discountValue DESC (giảm nhiều hơn lên trước)
    const discountDiff = b.discountValue - a.discountValue;
    if (discountDiff !== 0) return discountDiff;

    // 2. minOrderValue ASC (dễ dùng hơn lên trước)
    const minOrderDiff = a.minOrderValue - b.minOrderValue;
    if (minOrderDiff !== 0) return minOrderDiff;

    // 3. endDate ASC (sắp hết hạn lên trước)
    if (a.endDate && b.endDate) {
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    }
    if (a.endDate) return -1;
    if (b.endDate) return 1;

    return 0;
  });

  return { ...result, data: sorted };
};

// Helper — tính nhóm ưu tiên (số nhỏ = ưu tiên cao)
const getVoucherScore = (voucher: VoucherCard, cartTotal: number): { group: number } => {
  const now = new Date();

  // Hết hạn hoặc không active → nhóm 4 (thấp nhất)
  if (!voucher.isActive || voucher.isExpired) {
    return { group: 4 };
  }

  // Chưa đủ điều kiện → nhóm 3
  const meetsMinOrder = cartTotal >= voucher.minOrderValue;
  if (!meetsMinOrder) {
    return { group: 3 };
  }

  // Dùng được ngay + hết lượt → nhóm 3
  if (!voucher.isAvailable) {
    return { group: 3 };
  }

  // Dùng được ngay → nhóm 1
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
  if (orderTotal < Number(voucher.minOrderValue)) return { isValid: false, message: `Đơn hàng tối thiểu ${Number(voucher.minOrderValue).toLocaleString("vi-VN")}đ` };
  if (voucher.maxUses && voucher.usesCount >= voucher.maxUses) return { isValid: false, message: "Mã voucher đã hết lượt sử dụng" };

  if (!checkVoucherTargets(voucher.targets ?? [], cartItems)) {
    return { isValid: false, message: "Voucher không áp dụng cho sản phẩm trong giỏ hàng" };
  }

  if (userId) {
    const userVoucher = await repo.findUserVoucherUsage(userId, voucher.id);

    const isPrivateVoucher = await repo.hasVoucherUsers(voucher.id);

    // PRIVATE voucher
    if (isPrivateVoucher) {
      if (!userVoucher) {
        return { isValid: false, message: "Voucher này không dành cho bạn" };
      }

      if (userVoucher.usedCount >= userVoucher.maxUses) {
        return { isValid: false, message: "Bạn đã hết lượt sử dụng voucher này" };
      }
    }

    // PUBLIC voucher
    else {
      if (voucher.maxUsesPerUser) {
        const usageCount = await repo.countVoucherUsage(userId, voucher.id);

        if (usageCount >= voucher.maxUsesPerUser) {
          return { isValid: false, message: "Bạn đã hết lượt sử dụng voucher này" };
        }
      }
    }
  }

  // Tính eligible subtotal (chỉ các item khớp target)
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

export const createVoucher = async (input: CreateVoucherInput) => {
  const exists = await repo.checkVoucherCode(input.code);
  if (exists) throw new BadRequestError("Mã voucher đã tồn tại");
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
  if (!voucher.deletedAt) throw new BadRequestError("Chỉ có thể xoá vĩnh viễn voucher đã chuyển vào thùng rác");
  return repo.hardDelete(id);
};

// ── Assign ────────────────────────────────────────────────────────────────────

export const assignVoucherToUsers = async (input: AssignVoucherToUsersInput) => {
  await getVoucherById(input.voucherId);
  return repo.assignToUsers(input.voucherId, input.userIds, input.maxUsesPerUser);
};
