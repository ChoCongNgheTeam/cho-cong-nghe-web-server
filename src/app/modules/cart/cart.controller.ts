import { Request, Response } from "express";
import * as cartService from "./cart.service";
import { addToCartSchema, updateCartItemSchema } from "./cart.validation";

/**
 * GET CART
 * - User: Lấy từ DB
 * - Guest: Nhận items từ body (FE gửi localStorage lên), validate và trả về data chuẩn
 */
export const getCartHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    // 1. Logged-in User
    if (userId) {
      const cart = await cartService.getCart(userId);
      return res.json({
        data: cart,
        message: "Lấy giỏ hàng thành công",
      });
    }

    // 2. Guest User - Validate localStorage items
    const { items } = req.body; 
    const validatedCart = await cartService.validateLocalStorageCart(items || []);
    
    return res.json({
      data: validatedCart,
      message: "Lấy giỏ hàng (Guest) thành công",
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message || "Lỗi server" });
  }
};

/**
 * SYNC CART (Chỉ gọi khi vừa Login)
 */
export const syncCartHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    const { items } = req.body; // Items từ localStorage
    if (!Array.isArray(items) || items.length === 0) {
      return res.json({ message: "Không có sản phẩm để đồng bộ" });
    }

    const result = await cartService.syncLocalStorageToDatabase(userId, items);
    
    res.json({
      data: result,
      message: `Đồng bộ thành công: ${result.synced} sản phẩm`,
      success: true,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ADD TO CART (User Only)
 * Guest thêm vào localStorage ở FE, không gọi API này.
 */
export const addToCartHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        message: "Vui lòng đăng nhập để lưu giỏ hàng server. Khách vui lòng lưu tại trình duyệt." 
      });
    }

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
 * VALIDATE ITEM (Cho Guest check giá/tồn kho trước khi thêm vào localStorage)
 */
/**
 * VALIDATE ITEM (Cho Guest check giá/tồn kho trước khi thêm vào localStorage)
 */
export const validateItemHandler = async (req: Request, res: Response) => {
  try {
    console.log("🔍 validateItemHandler called");
    console.log("📍 req.user:", req.user);
    console.log("📦 req.body:", req.body);
    
    const { productVariantId, quantity } = req.body;
    
    // Gọi service check tồn kho và lấy thông tin variant
    const check = await cartService.validateCartItem(productVariantId, quantity);
    
    if (!check.isValid) {
      return res.status(400).json({ message: check.errors?.join(", ") });
    }

    // Lấy thông tin màu sắc từ kết quả check của service
    const colorLabel = check.colorAttr?.attributeOption.label;
    const colorValue = check.colorAttr?.attributeOption.value;

    // Trả về full info để FE lưu vào localStorage
    const responseData = {
      
      productVariantId: check.variant.id,
      productId: check.variant.product.id,
      productName: check.variant.product.name,
      productSlug: check.variant.product.slug,
      brandName: check.variant.product.brand.name,
      variantCode: check.variant.code || undefined,
      image: check.variant.product.img[0]?.imageUrl || undefined,
      
      // --- THÊM PHẦN NÀY ĐỂ HIỆN MÀU ---
      color: colorLabel,       // Ví dụ: "Xanh"
      colorValue: colorValue,  // Ví dụ: "#0000FF"
      // ---------------------------------

      quantity: quantity,
      unitPrice: Number(check.variant.price),
      totalPrice: quantity * Number(check.variant.price),
      availableQuantity: check.availableQuantity,
      
    };

    console.log("✅ validateItemHandler success");
    res.json({
      data: responseData,
      message: "Sản phẩm hợp lệ",
    });
  } catch (error: any) {
    console.error("❌ validateItemHandler error:", error.message);
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