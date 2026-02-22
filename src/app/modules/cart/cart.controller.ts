import { Request, Response } from "express";
import * as cartService from "./cart.service";
import { addToCartSchema, updateCartItemSchema } from "./cart.validation";

/**
 * GET CART
 * - Lấy giỏ hàng từ DB cho User đã đăng nhập.
 * - Guest tự quản lý tại localStorage, không gọi API này.
 */
export const getCartHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const cart = await cartService.getCart(userId);
    return res.json({
      data: cart,
      message: "Lấy giỏ hàng thành công",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Lỗi server" });
  }
};

/**
 * SYNC CART (Chỉ gọi khi vừa Login)
 * - Xử lý Soft Validate: Nếu thiếu hàng thì tự chỉnh số lượng và báo warning
 */
export const syncCartHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Vui lòng đăng nhập" });

    const { items } = req.body; 
    if (!Array.isArray(items) || items.length === 0) {
      return res.json({ message: "Không có sản phẩm để đồng bộ", success: true });
    }

    const result = await cartService.syncLocalStorageToDatabase(userId, items);
    const hasWarnings = result.warnings.length > 0;
    
    res.json({
      data: result,
      message: hasWarnings 
        ? "Giỏ hàng đã được cập nhật theo tồn kho hiện tại" 
        : `Đồng bộ thành công: ${result.synced} sản phẩm`,
      hasWarnings: hasWarnings,
      warnings: result.warnings,
      success: true,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ADD TO CART (User Only)
 */
export const addToCartHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const input = addToCartSchema.parse(req.body);
    const cartItem = await cartService.addToCart(userId, input);

    res.status(201).json({
      data: cartItem,
      message: "Thêm vào giỏ hàng thành công",
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * VALIDATE ITEM (Cho FE check tồn kho/giá qua cơ chế Debounce)
 */
export const validateItemHandler = async (req: Request, res: Response) => {
  try {
    const { productVariantId, quantity } = req.body;
    
    const check = await cartService.validateCartItem(productVariantId, quantity);
    
    if (!check.isValid) {
      return res.status(400).json({ message: check.errors?.join(", ") });
    }

    const colorLabel = check.colorAttr?.attributeOption.label;
    const colorValue = check.colorAttr?.attributeOption.value;

    const responseData = {
      productVariantId: check.variant.id,
      productId: check.variant.product.id,
      productName: check.variant.product.name,
      productSlug: check.variant.product.slug,
      brandName: check.variant.product.brand.name,
      variantCode: check.variant.code || undefined,
      image: check.variant.product.img[0]?.imageUrl || undefined,
      color: colorLabel,
      colorValue: colorValue,
      quantity: quantity,
      unitPrice: Number(check.variant.price),
      totalPrice: quantity * Number(check.variant.price),
      availableQuantity: check.availableQuantity,
    };

    res.json({
      data: responseData,
      message: "Sản phẩm hợp lệ",
    });
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

/**
 * UPDATE ITEM (User Only)
 */
export const updateCartItemHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { cartItemId } = req.params;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const input = updateCartItemSchema.parse(req.body);
    const updated = await cartService.updateCartItem(userId, cartItemId, input);

    res.json({ data: updated, message: "Cập nhật thành công" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * REMOVE ITEM (User Only)
 */
export const removeFromCartHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { cartItemId } = req.params;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    await cartService.removeFromCart(userId, cartItemId);
    res.json({ message: "Đã xóa sản phẩm" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * CLEAR CART (User Only)
 */
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