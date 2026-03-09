import { Request, Response } from "express";
import * as wishlistService from "./wishlist.service";

export const getWishlistHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await wishlistService.getWishlist(userId, page, limit);

  res.json({
    data: result.items,
    meta: result.meta,
    message: "Lấy danh sách yêu thích thành công",
  });
};

export const addToWishlistHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { productId } = req.body;

  const wishlistItem = await wishlistService.addToWishlist(userId, productId);

  res.status(201).json({
    data: wishlistItem,
    message: "Thêm sản phẩm vào danh sách yêu thích thành công",
  });
};

export const removeFromWishlistHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { productId } = req.body;

  await wishlistService.removeFromWishlist(userId, productId);

  res.json({
    message: "Xoá sản phẩm khỏi danh sách yêu thích thành công",
  });
};

export const checkWishlistHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { productId } = req.params;

  const isInWishlist = await wishlistService.checkInWishlist(userId, productId);

  res.json({
    data: { isInWishlist },
    message: "Kiểm tra danh sách yêu thích thành công",
  });
};