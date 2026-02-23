import { Request, Response } from "express";
import * as wishlistService from "./wishlist.service";

// Get user's wishlist
export const getWishlistHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const wishlist = await wishlistService.getWishlist(userId);

  res.json({
    data: wishlist,
    total: wishlist.length,
    message: "Lấy danh sách yêu thích thành công",
  });
};

// Add product to wishlist
export const addToWishlistHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { productVariantId } = req.body;

  const wishlistItem = await wishlistService.addToWishlist(userId, productVariantId);

  res.status(201).json({
    data: wishlistItem,
    message: "Thêm sản phẩm vào danh sách yêu thích thành công",
  });
};

// Remove product from wishlist
export const removeFromWishlistHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { productVariantId } = req.body;

  await wishlistService.removeFromWishlist(userId, productVariantId);

  res.json({
    message: "Xoá sản phẩm khỏi danh sách yêu thích thành công",
  });
};

// Check if product is in wishlist
export const checkWishlistHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { productVariantId } = req.params;

  const isInWishlist = await wishlistService.checkInWishlist(userId, productVariantId);

  res.json({
    data: {
      isInWishlist,
    },
    message: "Kiểm tra danh sách yêu thích thành công",
  });
};
