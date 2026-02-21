import { Request, Response } from "express";
import * as voucherService from "./voucher.service";
import { ListVouchersQuery, ValidateVoucherInput } from "./voucher.validation";

const paginatedResponse = (result: any, message: string) => ({
  data: result.data,
  pagination: {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  },
  message,
});

export const getVouchersPublicHandler = async (req: Request, res: Response) => {
  const result = await voucherService.getVouchers(req.query as unknown as ListVouchersQuery);
  res.json(paginatedResponse(result, "Lấy danh sách voucher thành công"));
};

export const getVoucherByCodeHandler = async (req: Request, res: Response) => {
  const voucher = await voucherService.getVoucherByCode(req.params.code);
  res.json({ data: voucher, message: "Lấy thông tin voucher thành công" });
};

export const validateVoucherHandler = async (req: Request, res: Response) => {
  const input: ValidateVoucherInput = {
    code: req.body.code,
    orderTotal: req.body.orderTotal,
    userId: req.user?.id,
  };

  const result = await voucherService.validateVoucher(input);

  // validateVoucher trả về isValid thay vì throw — response tùy theo kết quả
  res.json({
    data: result.isValid ? { discount: result.discount, voucher: result.voucher } : null,
    message: result.message || "Áp dụng voucher thành công",
  });
};

export const getUserVouchersHandler = async (req: Request, res: Response) => {
  const vouchers = await voucherService.getUserVouchers(req.user!.id);
  res.json({ data: vouchers, message: "Lấy danh sách voucher của bạn thành công" });
};

export const getVouchersAdminHandler = async (req: Request, res: Response) => {
  const result = await voucherService.getVouchers(req.query as unknown as ListVouchersQuery);
  res.json(paginatedResponse(result, "Lấy danh sách voucher thành công"));
};

export const getVoucherByIdHandler = async (req: Request, res: Response) => {
  const voucher = await voucherService.getVoucherById(req.params.id);
  res.json({ data: voucher, message: "Lấy chi tiết voucher thành công" });
};

export const createVoucherHandler = async (req: Request, res: Response) => {
  const voucher = await voucherService.createVoucher(req.body);
  res.status(201).json({ data: voucher, message: "Tạo voucher thành công" });
};

export const updateVoucherHandler = async (req: Request, res: Response) => {
  const voucher = await voucherService.updateVoucher(req.params.id, req.body);
  res.json({ data: voucher, message: "Cập nhật voucher thành công" });
};

export const deleteVoucherHandler = async (req: Request, res: Response) => {
  await voucherService.deleteVoucher(req.params.id);
  res.json({ message: "Xóa voucher thành công" });
};

export const assignVoucherToUsersHandler = async (req: Request, res: Response) => {
  const result = await voucherService.assignVoucherToUsers(req.body);
  res.json({
    data: result,
    message: `Gán voucher cho ${result.assigned} người dùng thành công`,
  });
};
