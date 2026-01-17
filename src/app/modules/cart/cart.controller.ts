import { Request, Response } from "express";
import * as cartService from "./cart.service";
import { addToCartSchema, updateCartItemSchema } from "./cart.validation";

/**
 * Lấy giỏ hàng của user hiện tại
 */
export const getCartHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Vui lòng đăng nhập để xem giỏ hàng",
      });
    }

    const cart = await cartService.getCart(userId);

    res.json({
      data: cart,
      message: "Lấy giỏ hàng thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Thêm sản phẩm vào giỏ hàng
 */
export const addToCartHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng",
      });
    }

    const input = addToCartSchema.parse(req.body);
    const cartItem = await cartService.addToCart(userId, input);

    res.status(201).json({
      data: cartItem,
      message: "Thêm sản phẩm vào giỏ hàng thành công",
    });
  } catch (error: any) {
    const statusCode = error.message?.includes("không tồn tại")
      ? 404
      : error.message?.includes("không có quyền")
        ? 403
        : 400;

    res.status(statusCode).json({
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 */
export const updateCartItemHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { cartItemId } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "Vui lòng đăng nhập để cập nhật giỏ hàng",
      });
    }

    const input = updateCartItemSchema.parse(req.body);
    const cartItem = await cartService.updateCartItem(userId, cartItemId, input);

    res.json({
      data: cartItem,
      message: "Cập nhật giỏ hàng thành công",
    });
  } catch (error: any) {
    const statusCode = error.message?.includes("không tồn tại")
      ? 404
      : error.message?.includes("không có quyền")
        ? 403
        : 400;

    res.status(statusCode).json({
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Xóa sản phẩm khỏi giỏ hàng
 */
export const removeFromCartHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { cartItemId } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "Vui lòng đăng nhập để xóa sản phẩm",
      });
    }

    const result = await cartService.removeFromCart(userId, cartItemId);

    res.json({
      data: result,
      message: "Xóa sản phẩm thành công",
    });
  } catch (error: any) {
    const statusCode = error.message?.includes("không tồn tại")
      ? 404
      : error.message?.includes("không có quyền")
        ? 403
        : 400;

    res.status(statusCode).json({
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Xóa toàn bộ giỏ hàng
 */
export const clearCartHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Vui lòng đăng nhập để làm trống giỏ hàng",
      });
    }

    const result = await cartService.clearCart(userId);

    res.json({
      data: result,
      message: "Giỏ hàng đã được làm trống",
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Xác nhận giỏ hàng trước khi checkout
 */
export const validateCartHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Vui lòng đăng nhập",
      });
    }

    const result = await cartService.validateCart(userId);

    res.json({
      data: result,
      message: "Kiểm tra giỏ hàng thành công",
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "Lỗi server",
    });
  }
};
