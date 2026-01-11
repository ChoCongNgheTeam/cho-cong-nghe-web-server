import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import * as c from "./wishlist.controller";
import { addToWishlistSchema, removeFromWishlistSchema, wishlistParamsSchema } from "./wishlist.validation";

const router = Router();

// Get user's wishlist
router.get("/", authMiddleware, c.getWishlistHandler);

// Add product to wishlist
router.post(
  "/add",
  authMiddleware,
  validate(addToWishlistSchema, "body"),
  c.addToWishlistHandler
);

// Remove product from wishlist
router.delete(
  "/remove",
  authMiddleware,
  validate(removeFromWishlistSchema, "body"),
  c.removeFromWishlistHandler
);

// Check if product is in wishlist
router.get(
  "/check/:productVariantId",
  authMiddleware,
  validate(wishlistParamsSchema, "params"),
  c.checkWishlistHandler
);

export default router;
