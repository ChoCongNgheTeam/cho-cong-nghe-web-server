import { Request, Response } from "express";
import * as service from "./user-address.service";
import { CreateAddressInput, UpdateAddressInput } from "./user-address.types";

// ==================== USER ADDRESS CONTROLLERS ====================

export const getUserAddressesHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await service.getUserAddresses(userId);
  res.json({ success: true, data: result.data, total: result.total, message: "Lấy danh sách địa chỉ thành công" });
};

export const getAddressHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const address = await service.getAddress(req.params.addressId, userId);
  res.json({ success: true, data: address, message: "Lấy thông tin địa chỉ thành công" });
};

export const createAddressHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const address = await service.createAddress(userId, req.body as CreateAddressInput);
  res.status(201).json({ success: true, data: address, message: "Tạo địa chỉ thành công" });
};

export const updateAddressHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const address = await service.updateAddress(req.params.addressId, userId, req.body as UpdateAddressInput);
  res.json({ success: true, data: address, message: "Cập nhật địa chỉ thành công" });
};

export const deleteAddressHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  await service.deleteAddress(req.params.addressId, userId);
  res.json({ success: true, message: "Xóa địa chỉ thành công" });
};

export const setDefaultAddressHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const address = await service.setDefaultAddress(req.params.addressId, userId);
  res.json({ success: true, data: address, message: "Đặt địa chỉ mặc định thành công" });
};

export const getDefaultAddressHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const address = await service.getDefaultAddress(userId);
  res.json({ success: true, data: address, message: "Lấy địa chỉ mặc định thành công" });
};

// ==================== ADMIN & STAFF CONTROLLERS ====================

export const getAllAddressesAdminHandler = async (req: Request, res: Response) => {
  const result = await service.getAllAddressesAdmin(req.query);
  res.json({
    success: true,
    data: result.data,
    meta: {
      total: result.total,
      page: result.page,
      perPage: result.perPage,
      totalPages: Math.ceil(result.total / result.perPage),
    },
    message: "Lấy danh sách địa chỉ toàn hệ thống thành công",
  });
};

export const softDeleteAddressAdminHandler = async (req: Request, res: Response) => {
  await service.softDeleteAddressAdmin(req.params.addressId, req.user!.id);
  res.json({ success: true, message: "Đã chuyển địa chỉ vào thùng rác" });
};

export const getDeletedAddressesHandler = async (req: Request, res: Response) => {
  const result = await service.getDeletedAddresses();
  res.json({ success: true, data: result, total: result.length, message: "Lấy danh sách địa chỉ đã xóa thành công" });
};

export const restoreAddressHandler = async (req: Request, res: Response) => {
  await service.restoreAddress(req.params.addressId);
  res.json({ success: true, message: "Khôi phục địa chỉ thành công" });
};

export const hardDeleteAddressHandler = async (req: Request, res: Response) => {
  await service.hardDeleteAddress(req.params.addressId);
  res.status(204).send();
};