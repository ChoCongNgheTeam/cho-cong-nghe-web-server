import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import * as c from "./user-address.controller";
import {
  createAddressSchema,
  updateAddressSchema,
  addressIdSchema,
  provinceIdSchema,
  wardSearchSchema,
  createProvinceSchema,
  createWardSchema,
} from "./user-address.validation";

const router = Router();

// ==================== LOCATION ROUTES (PUBLIC) ====================

/**
 * Lấy tất cả tỉnh/thành phố
 * GET /api/v1/locations/provinces
 */
router.get("/locations/provinces", c.getProvincesHandler);

/**
 * Lấy wards theo province
 * GET /api/v1/locations/:provinceId/wards?page=1&perPage=50&q=search
 */
router.get(
  "/locations/:provinceId/wards",
  validate(provinceIdSchema, "params"),
  validate(wardSearchSchema, "query"),
  c.getWardsByProvinceHandler
);

/**
 * Tạo mới Tỉnh/Thành phố (Nên dành cho Admin)
 * POST /api/v1/locations/provinces
 */
router.post(
  "/locations/provinces",
  // authMiddleware,             <--  đăng nhập
  // authorize(['ADMIN']),       <--  chỉ Admin được tạo
  validate(createProvinceSchema, "body"),
  c.createProvinceHandler
);

/**
 * Tạo mới Phường/Xã (Nên dành cho Admin)
 * POST /api/v1/locations/wards
 */
router.post(
  "/locations/wards",
  // authMiddleware,             <--  đăng nhập
  // authorize(['ADMIN']),       <--  chỉ Admin được tạo
  validate(createWardSchema, "body"),
  c.createWardHandler
);

// ==================== ADDRESS ROUTES (PROTECTED) ====================

// Tất cả các route address yêu cầu đăng nhập
router.use(authMiddleware(true));

/**
 * Lấy tất cả địa chỉ của user
 * GET /api/v1/addresses
 */
router.get("/", c.getUserAddressesHandler);

/**
 * Lấy địa chỉ mặc định
 * GET /api/v1/addresses/default
 */
router.get("/default", c.getDefaultAddressHandler);

/**
 * Lấy một địa chỉ
 * GET /api/v1/addresses/:addressId
 */
router.get(
  "/:addressId",
  validate(addressIdSchema, "params"),
  c.getAddressHandler
);

/**
 * Tạo mới địa chỉ
 * POST /api/v1/addresses
 */
router.post(
  "/",
  validate(createAddressSchema, "body"),
  c.createAddressHandler
);

/**
 * Cập nhật địa chỉ
 * PATCH /api/v1/addresses/:addressId
 */
router.patch(
  "/:addressId",
  validate(addressIdSchema, "params"),
  validate(updateAddressSchema, "body"),
  c.updateAddressHandler
);

/**
 * Xóa địa chỉ
 * DELETE /api/v1/addresses/:addressId
 */
router.delete(
  "/:addressId",
  validate(addressIdSchema, "params"),
  c.deleteAddressHandler
);

/**
 * Đặt địa chỉ mặc định
 * PUT /api/v1/addresses/:addressId/set-default
 */
router.put(
  "/:addressId/set-default",
  validate(addressIdSchema, "params"),
  c.setDefaultAddressHandler
);

export default router;