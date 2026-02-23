import { Request, Response } from "express";
import * as service from "./user-address.service";
import { CreateAddressInput, UpdateAddressInput } from "./user-address.types";
import { CreateProvinceInput, CreateWardInput } from "./user-address.validation";


// ==================== ADDRESS CONTROLLERS ====================

/**
 * Lấy tất cả địa chỉ của user
 * GET /api/v1/addresses
 */
export const getUserAddressesHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await service.getUserAddresses(userId);

  res.json({
    success: true,
    data: result.data,
    total: result.total,
    message: "Lấy danh sách địa chỉ thành công",
  });
};

/**
 * Lấy một địa chỉ
 * GET /api/v1/addresses/:addressId
 */
export const getAddressHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { addressId } = req.params;

  const address = await service.getAddress(addressId, userId);

  res.json({
    success: true,
    data: address,
    message: "Lấy thông tin địa chỉ thành công",
  });
};

/**
 * Tạo mới địa chỉ
 * POST /api/v1/addresses
 */
export const createAddressHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const input: CreateAddressInput = req.body;
  const address = await service.createAddress(userId, input);

  res.status(201).json({
    success: true,
    data: address,
    message: "Tạo địa chỉ thành công",
  });
};

/**
 * Cập nhật địa chỉ
 * PATCH /api/v1/addresses/:addressId
 */
export const updateAddressHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { addressId } = req.params;
  const input: UpdateAddressInput = req.body;
  const address = await service.updateAddress(addressId, userId, input);

  res.json({
    success: true,
    data: address,
    message: "Cập nhật địa chỉ thành công",
  });
};

/**
 * Xóa địa chỉ
 * DELETE /api/v1/addresses/:addressId
 */
export const deleteAddressHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { addressId } = req.params;

  const result = await service.deleteAddress(addressId, userId);

  res.json({
    success: true,
    data: result,
    message: "Xóa địa chỉ thành công",
  });
};

/**
 * Đặt địa chỉ mặc định
 * PUT /api/v1/addresses/:addressId/set-default
 */
export const setDefaultAddressHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { addressId } = req.params;

  const address = await service.setDefaultAddress(addressId, userId);

  res.json({
    success: true,
    data: address,
    message: "Đặt địa chỉ mặc định thành công",
  });
};

/**
 * Lấy địa chỉ mặc định
 * GET /api/v1/addresses/default
 */
export const getDefaultAddressHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const address = await service.getDefaultAddress(userId);

  res.json({
    success: true,
    data: address,
    message: "Lấy địa chỉ mặc định thành công",
  });
};

// ==================== LOCATION CONTROLLERS ====================

/**
 * Lấy tất cả tỉnh/thành phố
 * GET /api/v1/locations/provinces
 */
export const getProvincesHandler = async (req: Request, res: Response) => {
  const provinces = await service.getProvinces();

  res.json({
    success: true,
    data: provinces,
    message: "Lấy danh sách tỉnh/thành phố thành công",
  });
};

/**
 * Lấy wards theo province
 * GET /api/v1/locations/provinces/:provinceId/wards
 */
export const getWardsByProvinceHandler = async (req: Request, res: Response) => {
  const { provinceId } = req.params;
  const { page = "1", perPage = "50", q } = req.query;

  const result = await service.getWardsByProvince(
    provinceId,
    parseInt(page as string),
    parseInt(perPage as string),
    q as string
  );

  res.json({
    success: true,
    data: result.data,
    meta: result.meta,
    message: "Lấy danh sách phường/xã thành công",
  });
};

/**
 * Tạo mới Tỉnh/Thành phố
 * POST /api/v1/locations/provinces
 */
export const createProvinceHandler = async (req: Request, res: Response) => {
  // Lưu ý: Cần check quyền Admin ở middleware route
  const input: CreateProvinceInput = req.body;
  const province = await service.createProvince(input);

  res.status(201).json({
    success: true,
    data: province,
    message: "Tạo tỉnh/thành phố thành công",
  });
};

/**
 * Tạo mới Phường/Xã
 * POST /api/v1/locations/wards
 */
export const createWardHandler = async (req: Request, res: Response) => {
  // Lưu ý: Cần check quyền Admin ở middleware route
  const input: CreateWardInput = req.body;
  const ward = await service.createWard(input);

  res.status(201).json({
    success: true,
    data: ward,
    message: "Tạo phường/xã thành công",
  });
};