import { Request, Response } from "express";
import * as wishlistService from "./wishlist.service";
import { addToWishlistSchema, removeFromWishlistSchema } from "./wishlist.validation";

// Get user's wishlist
export const getWishlistHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Bạn cần đăng nhập để xem danh sách yêu thích" });
    }

    const wishlist = await wishlistService.getWishlist(userId);

    res.json({
      data: wishlist,
      total: wishlist.length,
      message: "Lấy danh sách yêu thích thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Lỗi server" });
  }
};

// Add product to wishlist
export const addToWishlistHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Bạn cần đăng nhập để thêm sản phẩm vào danh sách yêu thích" });
    }

    const { productVariantId } = addToWishlistSchema.parse(req.body);

    const wishlistItem = await wishlistService.addToWishlist(userId, productVariantId);

    res.status(201).json({
      data: wishlistItem,
      message: "Thêm sản phẩm vào danh sách yêu thích thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Lỗi server" });
  }
};

// Remove product from wishlist
export const removeFromWishlistHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Bạn cần đăng nhập để xoá sản phẩm khỏi danh sách yêu thích" });
    }

    const { productVariantId } = removeFromWishlistSchema.parse(req.body);

    await wishlistService.removeFromWishlist(userId, productVariantId);

    res.json({
      message: "Xoá sản phẩm khỏi danh sách yêu thích thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Lỗi server" });
  }
};

// Check if product is in wishlist
export const checkWishlistHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Bạn cần đăng nhập để kiểm tra danh sách yêu thích" });
    }

    const { productVariantId } = req.params;

    const isInWishlist = await wishlistService.checkInWishlist(userId, productVariantId);

    res.json({
      data: {
        isInWishlist,
      },
      message: "Kiểm tra danh sách yêu thích thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Lỗi server" });
  }
};
