import * as repo from "./voucher.repository";
import { CreateVoucherInput, UpdateVoucherInput, ListVouchersQuery, ValidateVoucherInput, AssignVoucherToUsersInput } from "./voucher.validation";
import { transformVoucherCard, transformVoucherDetail, transformUserVoucher, calculateDiscount, hasVoucherStarted, isVoucherExpired } from "./voucher.transformers";
import { VoucherValidationResult } from "./voucher.types";
import { DiscountType } from "@prisma/client";
import { NotFoundError, BadRequestError } from "@/errors";

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

// validateVoucher trả về VoucherValidationResult thay vì throw
// vì đây là business validation có nhiều trường hợp isValid: false hợp lệ
export const validateVoucher = async (input: ValidateVoucherInput): Promise<VoucherValidationResult> => {
  const { code, orderTotal, userId } = input;

  const voucher = await repo.findByCode(code);
  if (!voucher) return { isValid: false, message: "Mã voucher không tồn tại" };

  if (!voucher.isActive) return { isValid: false, message: "Mã voucher đã bị vô hiệu hóa" };

  if (!hasVoucherStarted(voucher.startDate)) {
    return { isValid: false, message: "Mã voucher chưa có hiệu lực" };
  }

  if (isVoucherExpired(voucher.endDate)) {
    return { isValid: false, message: "Mã voucher đã hết hạn" };
  }

  if (orderTotal < Number(voucher.minOrderValue)) {
    return {
      isValid: false,
      message: `Đơn hàng tối thiểu ${Number(voucher.minOrderValue).toLocaleString("vi-VN")}đ`,
    };
  }

  if (voucher.maxUses && voucher.usesCount >= voucher.maxUses) {
    return { isValid: false, message: "Mã voucher đã hết lượt sử dụng" };
  }

  if (userId) {
    const userVoucher = await repo.findUserVoucherUsage(userId, voucher.id);

    if (userVoucher) {
      if (userVoucher.usedCount >= userVoucher.maxUses) {
        return { isValid: false, message: "Bạn đã hết lượt sử dụng voucher này" };
      }
    } else if (voucher.maxUsesPerUser) {
      return { isValid: false, message: "Voucher này không dành cho bạn" };
    }
  }

  const discount = calculateDiscount(voucher.discountType as DiscountType, Number(voucher.discountValue), orderTotal);

  return { isValid: true, discount, voucher: transformVoucherDetail(voucher) };
};

export const getVoucherById = async (id: string) => {
  const voucher = await repo.findById(id);
  if (!voucher) throw new NotFoundError("Voucher");
  return transformVoucherDetail(voucher);
};

export const createVoucher = async (input: CreateVoucherInput) => {
  const exists = await repo.checkVoucherCode(input.code);
  if (exists) throw new BadRequestError("Mã voucher đã tồn tại");

  const voucher = await repo.create(input);
  return transformVoucherDetail(voucher);
};

export const updateVoucher = async (id: string, input: UpdateVoucherInput) => {
  const existing = await getVoucherById(id);

  if (input.code && input.code !== existing.code) {
    const exists = await repo.checkVoucherCode(input.code);
    if (exists) throw new BadRequestError("Mã voucher đã tồn tại");
  }

  const voucher = await repo.update(id, input);
  return transformVoucherDetail(voucher);
};

export const deleteVoucher = async (id: string) => {
  await getVoucherById(id);
  return repo.remove(id);
};

export const assignVoucherToUsers = async (input: AssignVoucherToUsersInput) => {
  await getVoucherById(input.voucherId);
  return repo.assignToUsers(input.voucherId, input.userIds, input.maxUsesPerUser);
};
