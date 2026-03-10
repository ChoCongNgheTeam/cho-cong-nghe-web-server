import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import * as c from "./wishlist.controller";
import { 
  addToWishlistSchema, 
  removeFromWishlistSchema, 
  wishlistParamsSchema,
  getWishlistQuerySchema
} from "./wishlist.validation";

const router = Router();

router.get("/", authMiddleware(), validate(getWishlistQuerySchema, "query"), asyncHandler(c.getWishlistHandler));
router.post("/add", authMiddleware(), validate(addToWishlistSchema, "body"), asyncHandler(c.addToWishlistHandler));
router.delete("/remove", authMiddleware(), validate(removeFromWishlistSchema, "body"), asyncHandler(c.removeFromWishlistHandler));
router.get("/check/:productId", authMiddleware(), validate(wishlistParamsSchema, "params"), asyncHandler(c.checkWishlistHandler));

export default router;