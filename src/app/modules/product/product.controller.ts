import { Request, Response } from "express";
import * as productService from "./product.service";
import { listProductsSchema } from "./product.validation";
import fs from "fs";
import { uploadImage } from "src/services/cloudinary.service";

// =====================
// === PUBLIC CONTROLLERS ===
// =====================
// Upload ảnh sản phẩm lên Cloudinary
export const uploadProductImage = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Không có file được upload",
      });
    }

    // Upload Cloudinary
    const image = await uploadImage(
      req.file.path,
      "products"
    );

    // Xóa file tạm
    fs.unlinkSync(req.file.path);

    return res.json({
      message: "Upload ảnh thành công",
      image,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message,
    });
  }
};



// Lấy danh sách sản phẩm (public)
export const getProductsPublicHandler = async (req: Request, res: Response) => {
  try {
    const query = listProductsSchema.parse(req.query);
    const result = await productService.getProductsPublic(query);

    res.json({
      data: result.data,
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      message: "Lấy danh sách sản phẩm thành công",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Lỗi server" });
  }
};

// Lấy chi tiết sản phẩm theo slug (public)
export const getProductBySlugHandler = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const product = await productService.getProductBySlug(slug);

    res.json({
      data: product,
      message: "Lấy chi tiết sản phẩm thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Lỗi server" });
  }
};

// =====================
// === ADMIN CONTROLLERS ===
// =====================

// Lấy danh sách sản phẩm (admin)
export const getProductsAdminHandler = async (req: Request, res: Response) => {
  try {
    const query = listProductsSchema.parse(req.query);
    const result = await productService.getProductsAdmin(query);

    res.json({
      data: result.data,
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      message: "Lấy danh sách sản phẩm thành công",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Lỗi server" });
  }
};

// Lấy chi tiết sản phẩm theo ID (admin)
export const getProductDetailHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    res.json({
      data: product,
      message: "Lấy chi tiết sản phẩm thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Lỗi server" });
  }
};

// Tạo sản phẩm
export const createProductHandler = async (req: Request, res: Response) => {
  try {
    const product = await productService.createProduct(req.body);

    res.status(201).json({
      data: product,
      message: "Tạo sản phẩm thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Lỗi server" });
  }
};

// Cập nhật sản phẩm
export const updateProductHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body);

    res.json({
      data: product,
      message: "Cập nhật sản phẩm thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Lỗi server" });
  }
};

// Xóa sản phẩm
export const deleteProductHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);

    res.json({
      message: "Xóa sản phẩm thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Lỗi server" });
  }
};
