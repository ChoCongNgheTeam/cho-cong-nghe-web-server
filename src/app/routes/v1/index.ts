import { Router } from "express";

import userRoutes from "@/app/modules/user/user.route";
import authRoutes from "@/app/modules/auth/auth.route";
import categoryRoutes from "@/app/modules/category/category.route";
import productRoutes from "@/app/modules/product/product.route";
import uploadRoutes from "@/app/modules/upload/upload.route";
import wishlistRoutes from "@/app/modules/wishlist/wishlist.route";
import orderRoutes from "@/app/modules/order/order.route";
import reviewRoutes from "@/app/modules/review/review.route";
import paymentRoutes from "@/app/modules/payment/payment.router";
import cartRoutes from "@/app/modules/cart/cart.route";
import userAddressRoutes from "@/app/modules/user-address/user-address.route";
import voucherRoutes from "@/app/modules/voucher/voucher.route";

const router = Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/upload", uploadRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/orders", orderRoutes);
router.use("/reviews", reviewRoutes);
router.use("/payments", paymentRoutes);
router.use("/cart", cartRoutes);
router.use("/addresses", userAddressRoutes);
router.use("/vouchers", voucherRoutes);
export default router;
