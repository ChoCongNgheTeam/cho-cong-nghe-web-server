import * as repo from "./voucher.repository";
import { CreateVoucherInput, UpdateVoucherInput, ListVouchersQuery, ValidateVoucherInput, AssignVoucherToUsersInput, BulkDeleteVouchersInput } from "./voucher.validation";
import { transformVoucherCard, transformVoucherDetail, transformUserVoucher, calculateDiscount, hasVoucherStarted, isVoucherExpired } from "./voucher.transformers";
import { VoucherValidationResult } from "./voucher.types";
import { DiscountType } from "@prisma/client";
import { NotFoundError, BadRequestError } from "@/errors";

// ── Helpers ───────────────────────────────────────────────────────────────────

const assertVoucherExists = async (id: string, includeDeleted = false) => {
  const voucher = await repo.findById(id, includeDeleted);
  if (!voucher) throw new NotFoundError("Voucher");
  return voucher;
};

// ── Public reads ──────────────────────────────────────────────────────────────

export const getVouchers = async (query: ListVouchersQuery) => {
  const result = await repo.findAll(query);
  return { ...result, data: result.data.map(transformVoucherCard) };
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
  const { code, orderTotal, userId } = input;

  const voucher = await repo.findByCode(code);
  if (!voucher) return { isValid: false, message: "Mã voucher không tồn tại" };
  if (!voucher.isActive) return { isValid: false, message: "Mã voucher đã bị vô hiệu hóa" };
  if (!hasVoucherStarted(voucher.startDate)) return { isValid: false, message: "Mã voucher chưa có hiệu lực" };
  if (isVoucherExpired(voucher.endDate)) return { isValid: false, message: "Mã voucher đã hết hạn" };
  if (orderTotal < Number(voucher.minOrderValue)) return { isValid: false, message: `Đơn hàng tối thiểu ${Number(voucher.minOrderValue).toLocaleString("vi-VN")}đ` };
  if (voucher.maxUses && voucher.usesCount >= voucher.maxUses) return { isValid: false, message: "Mã voucher đã hết lượt sử dụng" };

  if (userId) {
    const userVoucher = await repo.findUserVoucherUsage(userId, voucher.id);
    if (userVoucher) {
      if (userVoucher.usedCount >= userVoucher.maxUses) return { isValid: false, message: "Bạn đã hết lượt sử dụng voucher này" };
    } else if (voucher.maxUsesPerUser) {
      return { isValid: false, message: "Voucher này không dành cho bạn" };
    }
  }

  const discount = calculateDiscount(voucher.discountType as DiscountType, Number(voucher.discountValue), orderTotal);
  return { isValid: true, discount, voucher: transformVoucherDetail(voucher) };
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
