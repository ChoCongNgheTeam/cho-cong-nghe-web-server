import { Request, Response } from "express";
import * as service from "./user-address.service";
import { CreateAddressInput, UpdateAddressInput } from "./user-address.types";

/**
 * Lấy tất cả địa chỉ của user
 */
export const getUserAddressesHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Vui lòng đăng nhập",
      });
    }

    const result = await service.getUserAddresses(userId);

    res.json({
      data: result.data,
      total: result.total,
      message: "Lấy danh sách địa chỉ thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Lấy một địa chỉ
 */
export const getAddressHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { addressId } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "Vui lòng đăng nhập",
      });
    }

    const address = await service.getAddress(addressId, userId);

    res.json({
      data: address,
      message: "Lấy thông tin địa chỉ thành công",
    });
  } catch (error: any) {
    const statusCode = error.message?.includes("không có quyền") ? 403 : 404;
    res.status(statusCode).json({
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Tạo mới địa chỉ
 */
export const createAddressHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Vui lòng đăng nhập",
      });
    }

    const input: CreateAddressInput = req.body;
    const address = await service.createAddress(userId, input);

    res.status(201).json({
      data: address,
      message: "Tạo địa chỉ thành công",
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Cập nhật địa chỉ
 */
export const updateAddressHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { addressId } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "Vui lòng đăng nhập",
      });
    }

    const input: UpdateAddressInput = req.body;
    const address = await service.updateAddress(addressId, userId, input);

    res.json({
      data: address,
      message: "Cập nhật địa chỉ thành công",
    });
  } catch (error: any) {
    const statusCode = error.message?.includes("không có quyền")
      ? 403
      : error.message?.includes("không tồn tại")
        ? 404
        : 400;

    res.status(statusCode).json({
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Xóa địa chỉ
 */
export const deleteAddressHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { addressId } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "Vui lòng đăng nhập",
      });
    }

    const result = await service.deleteAddress(addressId, userId);

    res.json({
      data: result,
      message: "Xóa địa chỉ thành công",
    });
  } catch (error: any) {
    const statusCode = error.message?.includes("không có quyền")
      ? 403
      : error.message?.includes("không tồn tại")
        ? 404
        : 400;

    res.status(statusCode).json({
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Đặt địa chỉ mặc định
 */
export const setDefaultAddressHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { addressId } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "Vui lòng đăng nhập",
      });
    }

    const address = await service.setDefaultAddress(addressId, userId);

    res.json({
      data: address,
      message: "Đặt địa chỉ mặc định thành công",
    });
  } catch (error: any) {
    const statusCode = error.message?.includes("không có quyền")
      ? 403
      : error.message?.includes("không tồn tại")
        ? 404
        : 400;

    res.status(statusCode).json({
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Lấy địa chỉ mặc định
 */
export const getDefaultAddressHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Vui lòng đăng nhập",
      });
    }

    const address = await service.getDefaultAddress(userId);

    res.json({
      data: address,
      message: "Lấy địa chỉ mặc định thành công",
    });
  } catch (error: any) {
    res.status(404).json({
      message: error.message || "Lỗi server",
    });
  }
};
