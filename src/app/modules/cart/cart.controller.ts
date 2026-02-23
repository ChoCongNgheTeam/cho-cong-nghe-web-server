import { Request, Response } from "express";
import * as cartService from "./cart.service";
import { addToCartSchema, updateCartItemSchema } from "./cart.validation";

export const validateItemHandler = async (req: Request, res: Response) => {
  try {
    const { productVariantId, quantity } = req.body;
    const check = await cartService.validateCartItemStatus(productVariantId, quantity);
    
    // Chỉ trả về data tối thiểu cần thiết theo feedback
    return res.json({
      success: check.isValid,
      data: {
        availableQuantity: check.availableQuantity,
        isValid: check.isValid,
        errors: check.errors
      },
      message: check.isValid ? "Sản phẩm hợp lệ" : "Sản phẩm không đủ điều kiện"
    });
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const getCartHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const cart = await cartService.getCart(userId);
    res.json({ data: cart, message: "Lấy giỏ hàng thành công" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const syncCartHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { items } = req.body;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const result = await cartService.syncLocalStorageToDatabase(userId, items);
    res.json({ 
      data: result, 
      message: result.warnings.length > 0 ? "Cập nhật theo tồn kho" : "Đồng bộ thành công",
      success: true 
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addToCartHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const input = addToCartSchema.parse(req.body);
    const data = await cartService.addToCart(userId, input);
    res.status(201).json({ data, message: "Đã thêm vào giỏ hàng" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCartItemHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { cartItemId } = req.params;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const input = updateCartItemSchema.parse(req.body);
    const data = await cartService.updateCartItem(userId, cartItemId, input);
    res.json({ data, message: "Cập nhật thành công" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const removeFromCartHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    await cartService.removeFromCart(userId, req.params.cartItemId);
    res.json({ message: "Đã xóa sản phẩm" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const clearCartHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    await cartService.clearCart(userId);
    res.json({ message: "Giỏ hàng đã làm trống" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};