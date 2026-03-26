import { Router } from "express";

// ===== Core & Auth =====
import authRoutes from "@/app/modules/auth/auth.route";

// ===== User =====
import userRoutes from "@/app/modules/user/user.route";
import userAddressRoutes from "@/app/modules/user-address/user-address.route";
import wishlistRoutes from "@/app/modules/wishlist/wishlist.route";

// ===== Catalog =====
import categoryRoutes from "@/app/modules/category/category.route";
import brandRoutes from "@/app/modules/brand/brand.route";
import productRoutes from "@/app/modules/product/product.route";
import reviewRoutes from "@/app/modules/review/review.route";
import campaign from "@/app/modules/campaign/campaign.route";

// ===== Commerce =====
import cartRoutes from "@/app/modules/cart/cart.route";
import orderRoutes from "@/app/modules/order/order.route";
import paymentRoutes from "@/app/modules/payment/payment.route";
import promotionRoutes from "@/app/modules/promotion/promotion.route";
import voucherRoutes from "@/app/modules/voucher/voucher.route";
import checkoutRouter from "@/app/modules/checkout/checkout.route";

// ===== Content =====
import blogRouters from "@/app/modules/blog/blog.route";
import commentRoutes from "@/app/modules/comment/comment.route";
import blogWithCommentsRoutes from "@/app/modules/blog-with-comments/blog-with-comments.routes";
import imageMediaRouter from "@/app/modules/image-media/media.route";
import pageRoutes from "@/app/modules/page/page.route";

// ===== Upload & Home =====
import uploadRoutes from "@/app/modules/upload/upload.route";
import homeRouter from "@/app/modules/home/home.route";

import attributeRouter from "@/app/modules/attributes/attribute.route";
import specificationRouter from "@/app/modules/specifications/specification.route";

// ===== Chatbot =====
import { chatbotRoute } from "@/app/modules/chatbot/chatbot.route";

import searchRoutes from "@/app/modules/search/search.route";

import notificationRoutes from "@/app/modules/notification/notification.route";

import analyticsRouter from "@/app/modules/analytics/analytics.route";

const router = Router();

// ===== Core & Auth =====
router.use("/auth", authRoutes);

// ===== User =====
router.use("/users", userRoutes);
router.use("/addresses", userAddressRoutes);
router.use("/wishlist", wishlistRoutes);

// ===== Catalog =====
router.use("/categories", categoryRoutes);
router.use("/brands", brandRoutes);
router.use("/products", productRoutes);
router.use("/reviews", reviewRoutes);
router.use("/campaigns", campaign);

// ===== Commerce =====
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/promotions", promotionRoutes);
router.use("/vouchers", voucherRoutes);
router.use("/checkout", checkoutRouter);

// ===== Content =====
router.use("/blogs", blogRouters);
router.use("/comments", commentRoutes);
router.use("/blog-with-comments", blogWithCommentsRoutes);
router.use("/media", imageMediaRouter);
router.use("/pages", pageRoutes);

// ===== Upload & Home =====
router.use("/upload", uploadRoutes);
router.use("/home", homeRouter);

router.use("/attributes", attributeRouter);
router.use("/specifications", specificationRouter);

// ===== Chatbot =====
router.use("/chatbot", chatbotRoute);

// ===== Search =====
router.use("/search", searchRoutes);

// ===== Notification =====
router.use("/notifications", notificationRoutes);

// ===== Analytics =====
router.use("/analytics", analyticsRouter);

export default router;
