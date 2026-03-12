import { Request, Response } from "express";
import * as wishlistService from "./wishlist.service";
import { getWishlistWithPricing } from "../pricing/use-cases/getWishlistWithPricing.service";

export const getWishlistHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  // Sử dụng Orchestrator thay vì Service thường
  const result = await getWishlistWithPricing(userId, page, limit);

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
  res.status(201).json({ data: wishlistItem, message: "Thêm thành công" });
};

export const removeFromWishlistHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { productId } = req.body;
  await wishlistService.removeFromWishlist(userId, productId);
  res.json({ message: "Xoá thành công" });
};

export const checkWishlistHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { productId } = req.params;
  const isInWishlist = await wishlistService.checkInWishlist(userId, productId);
  res.json({ data: { isInWishlist }, message: "Kiểm tra thành công" });
};