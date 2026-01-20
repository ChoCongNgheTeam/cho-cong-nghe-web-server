import { Request, Response } from "express";
import * as voucherService from "./voucher.service";
import { ListVouchersQuery, ValidateVoucherInput } from "./voucher.validation";

type ValidatedQuery<T> = Request & {
  query: T;
};

// =====================
// === PUBLIC HANDLERS ===
// =====================

export const getVouchersPublicHandler = async (
  req: ValidatedQuery<ListVouchersQuery>,
  res: Response,
) => {
  try {
    const result = await voucherService.getVouchers(req.query);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
      message: "Lấy danh sách voucher thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const getVoucherByCodeHandler = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const voucher = await voucherService.getVoucherByCode(code);

    res.json({
      success: true,
      data: voucher,
      message: "Lấy thông tin voucher thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const validateVoucherHandler = async (req: Request, res: Response) => {
  try {
    const input: ValidateVoucherInput = {
      code: req.body.code,
      orderTotal: req.body.orderTotal,
      userId: (req as any).user?.id,
    };

    const result = await voucherService.validateVoucher(input);

    res.json({
      success: result.isValid,
      data: result.isValid
        ? {
            discount: result.discount,
            voucher: result.voucher,
          }
        : null,
      message: result.message || "Áp dụng voucher thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const getUserVouchersHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const vouchers = await voucherService.getUserVouchers(userId);

    res.json({
      success: true,
      data: vouchers,
      message: "Lấy danh sách voucher của bạn thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

// =====================
// === ADMIN HANDLERS ===
// =====================

export const getVouchersAdminHandler = async (
  req: ValidatedQuery<ListVouchersQuery>,
  res: Response,
) => {
  try {
    const result = await voucherService.getVouchers(req.query);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
      message: "Lấy danh sách voucher thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const getVoucherByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const voucher = await voucherService.getVoucherById(id);

    res.json({
      success: true,
      data: voucher,
      message: "Lấy chi tiết voucher thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const createVoucherHandler = async (req: Request, res: Response) => {
  try {
    const voucher = await voucherService.createVoucher(req.body);

    res.status(201).json({
      success: true,
      data: voucher,
      message: "Tạo voucher thành công",
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: error.errors,
      });
    }

    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const updateVoucherHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const voucher = await voucherService.updateVoucher(id, req.body);

    res.json({
      success: true,
      data: voucher,
      message: "Cập nhật voucher thành công",
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: error.errors,
      });
    }

    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const deleteVoucherHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await voucherService.deleteVoucher(id);

    res.json({
      success: true,
      message: "Xóa voucher thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const assignVoucherToUsersHandler = async (req: Request, res: Response) => {
  try {
    const result = await voucherService.assignVoucherToUsers(req.body);

    res.json({
      success: true,
      data: result,
      message: `Gán voucher cho ${result.assigned} người dùng thành công`,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: error.errors,
      });
    }

    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};
