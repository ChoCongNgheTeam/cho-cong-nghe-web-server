import { Request, Response } from "express";
import * as cartService from "./cart.service";
import { addToCartSchema, updateCartItemSchema, changeVariantSchema } from "./cart.validation";
import { UnauthorizedError } from "@/errors"; 

export const validateItemHandler = async (req: Request, res: Response) => {
  const { productVariantId, quantity } = req.body;
  const check = await cartService.validateCartItemStatus(productVariantId, quantity);
  
  res.json({
    success: check.isValid,
    data: {
      availableQuantity: check.availableQuantity,
      isValid: check.isValid,
      errors: check.errors
    },
    message: check.isValid ? "Sản phẩm hợp lệ" : "Sản phẩm không đủ điều kiện"
  });
};

export const getCartHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new UnauthorizedError("Vui lòng đăng nhập");

  const cart = await cartService.getCart(userId);
  res.json({ data: cart, message: "Lấy giỏ hàng thành công" });
};

export const syncCartHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { items } = req.body;
  if (!userId) throw new UnauthorizedError("Vui lòng đăng nhập");

  const result = await cartService.syncLocalStorageToDatabase(userId, items);
  res.json({ 
    data: result, 
    message: result.warnings.length > 0 ? "Cập nhật theo tồn kho" : "Đồng bộ thành công",
    success: true 
  });
};

export const addToCartHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new UnauthorizedError("Vui lòng đăng nhập");

  const input = addToCartSchema.parse(req.body);
  const data = await cartService.addToCart(userId, input);
  res.status(201).json({ data, message: "Đã thêm vào giỏ hàng" });
};

export const updateCartItemHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { cartItemId } = req.params;
  if (!userId) throw new UnauthorizedError("Vui lòng đăng nhập");

  const input = updateCartItemSchema.parse(req.body);
  const data = await cartService.updateCartItem(userId, cartItemId, input);
  res.json({ data, message: "Cập nhật thành công" });
};

export const changeCartItemVariantHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { cartItemId } = req.params;
  if (!userId) throw new UnauthorizedError("Vui lòng đăng nhập");

  const input = changeVariantSchema.parse(req.body);
  const data = await cartService.changeCartItemVariant(userId, cartItemId, input);
  res.json({ data, message: "Đổi phân loại thành công" });
};

export const removeFromCartHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new UnauthorizedError("Vui lòng đăng nhập");

  await cartService.removeFromCart(userId, req.params.cartItemId);
  res.json({ message: "Đã xóa sản phẩm" });
};

export const clearCartHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new UnauthorizedError("Vui lòng đăng nhập");

  await cartService.clearCart(userId);
  res.json({ message: "Giỏ hàng đã làm trống" });
};