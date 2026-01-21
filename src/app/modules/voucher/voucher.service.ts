import * as repo from "./voucher.repository";
import {
  CreateVoucherInput,
  UpdateVoucherInput,
  ListVouchersQuery,
  ValidateVoucherInput,
  AssignVoucherToUsersInput,
} from "./voucher.validation";
import {
  transformVoucherCard,
  transformVoucherDetail,
  transformUserVoucher,
  calculateDiscount,
  hasVoucherStarted,
  isVoucherExpired,
} from "./voucher.transformers";
import { VoucherValidationResult } from "./voucher.types";
import { DiscountType } from "@prisma/client";

// =====================
// === PUBLIC SERVICES ===
// =====================

export const getVouchers = async (query: ListVouchersQuery) => {
  const result = await repo.findAll(query);

  return {
    ...result,
    data: result.data.map(transformVoucherCard),
  };
};

export const getVoucherByCode = async (code: string) => {
  const voucher = await repo.findByCode(code);

  if (!voucher) {
    const error: any = new Error("Không tìm thấy voucher");
    error.statusCode = 404;
    throw error;
  }

  return transformVoucherDetail(voucher);
};

export const getUserVouchers = async (userId: string) => {
  const vouchers = await repo.findUserVouchers(userId);

  return vouchers.map((v) => transformUserVoucher(v, v.userVoucherData));
};

export const validateVoucher = async (
  input: ValidateVoucherInput,
): Promise<VoucherValidationResult> => {
  const { code, orderTotal, userId } = input;

  // Find voucher
  const voucher = await repo.findByCode(code);

  if (!voucher) {
    return {
      isValid: false,
      message: "Mã voucher không tồn tại",
    };
  }

  // Check if voucher is active
  if (!voucher.isActive) {
    return {
      isValid: false,
      message: "Mã voucher đã bị vô hiệu hóa",
    };
  }

  // Check if voucher has started
  if (!hasVoucherStarted(voucher.startDate)) {
    return {
      isValid: false,
      message: "Mã voucher chưa có hiệu lực",
    };
  }

  // Check if voucher is expired
  if (isVoucherExpired(voucher.endDate)) {
    return {
      isValid: false,
      message: "Mã voucher đã hết hạn",
    };
  }

  // Check minimum order value
  if (orderTotal < Number(voucher.minOrderValue)) {
    return {
      isValid: false,
      message: `Đơn hàng tối thiểu ${Number(voucher.minOrderValue).toLocaleString("vi-VN")}đ`,
    };
  }

  // Check max uses
  if (voucher.maxUses && voucher.usesCount >= voucher.maxUses) {
    return {
      isValid: false,
      message: "Mã voucher đã hết lượt sử dụng",
    };
  }

  // Check user-specific usage if userId provided
  if (userId) {
    const userVoucher = await repo.findUserVoucherUsage(userId, voucher.id);

    if (userVoucher) {
      if (userVoucher.usedCount >= userVoucher.maxUses) {
        return {
          isValid: false,
          message: "Bạn đã hết lượt sử dụng voucher này",
        };
      }
    } else if (voucher.maxUsesPerUser) {
      // If voucher has maxUsesPerUser but user hasn't been assigned, deny
      return {
        isValid: false,
        message: "Voucher này không dành cho bạn",
      };
    }
  }

  // Calculate discount
  const discount = calculateDiscount(
    voucher.discountType as DiscountType,
    Number(voucher.discountValue),
    orderTotal,
  );

  return {
    isValid: true,
    discount,
    voucher: transformVoucherDetail(voucher),
  };
};

// =====================
// === ADMIN SERVICES ===
// =====================

export const getVoucherById = async (id: string) => {
  const voucher = await repo.findById(id);

  if (!voucher) {
    const error: any = new Error("Không tìm thấy voucher");
    error.statusCode = 404;
    throw error;
  }

  return transformVoucherDetail(voucher);
};

export const createVoucher = async (input: CreateVoucherInput) => {
  // Check if code already exists
  const exists = await repo.checkVoucherCode(input.code);
  if (exists) {
    const error: any = new Error("Mã voucher đã tồn tại");
    error.statusCode = 400;
    throw error;
  }

  const voucher = await repo.create(input);
  return transformVoucherDetail(voucher);
};

export const updateVoucher = async (id: string, input: UpdateVoucherInput) => {
  // Check voucher exists
  await getVoucherById(id);

  // If updating code, check if new code exists
  if (input.code) {
    const currentVoucher = await repo.findById(id);
    if (currentVoucher && input.code !== currentVoucher.code) {
      const exists = await repo.checkVoucherCode(input.code);
      if (exists) {
        const error: any = new Error("Mã voucher đã tồn tại");
        error.statusCode = 400;
        throw error;
      }
    }
  }

  const voucher = await repo.update(id, input);
  return transformVoucherDetail(voucher);
};

export const deleteVoucher = async (id: string) => {
  await getVoucherById(id);
  return repo.remove(id);
};

export const assignVoucherToUsers = async (input: AssignVoucherToUsersInput) => {
  const { voucherId, userIds, maxUsesPerUser } = input;

  // Check voucher exists
  await getVoucherById(voucherId);

  const result = await repo.assignToUsers(voucherId, userIds, maxUsesPerUser);

  return result;
};
