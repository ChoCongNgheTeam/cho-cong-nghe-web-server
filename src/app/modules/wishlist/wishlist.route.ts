import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import * as c from "./wishlist.controller";
import { addToWishlistSchema, removeFromWishlistSchema, wishlistParamsSchema } from "./wishlist.validation";

const router = Router();

// Get user's wishlist
router.get("/", authMiddleware(), asyncHandler(c.getWishlistHandler));

// Add product to wishlist
router.post(
  "/add",
  authMiddleware(),
  validate(addToWishlistSchema, "body"),
  asyncHandler(c.addToWishlistHandler)
);

// Remove product from wishlist
router.delete(
  "/remove",
  authMiddleware(),
  validate(removeFromWishlistSchema, "body"),
  asyncHandler(c.removeFromWishlistHandler)
);

// Check if product is in wishlist
router.get(
  "/check/:productVariantId",
  authMiddleware(),
  validate(wishlistParamsSchema, "params"),
  asyncHandler(c.checkWishlistHandler)
);

export default router;
