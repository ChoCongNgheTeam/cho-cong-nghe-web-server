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
import categoryVariantAttributeRoute from "@/app/modules/category-variant/category-variant-attribute.route";
import { aiContentRoute } from "@/app/modules/ai-content/ai-content.route";
import aiCompareRouter from "@/app/modules/ai-compare/ai-compare.router";
import settingsRouter from "@/app/modules/settings/settings.route";
import auditRouter from "@/app/modules/audit/audit.route";
import { initSettingsCache } from "@/app/modules/settings/settings.service";

// Audit middleware — tự động ghi log mọi mutation có xác thực
import { auditMiddleware } from "@/app/middlewares/audit.middleware";

import staffPermissionsRouter from "@/app/modules/staff-permissions/staff-permissions.route";

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
//  Mount auditMiddleware MỘT LẦN DUY NHẤT tại đây.
//
// Tại sao đặt ở đây (routes/v1) thay vì app.ts?
//   - app.ts mount trước express.json() nên body chưa parse được.
//   - Ở đây body đã được parse (express.json() chạy trong app.ts trước routes).
//
// Tại sao không cần lo req.user chưa có?
//   - auditMiddleware chỉ ĐĂNG KÝ res.on("finish"), rồi gọi next() ngay.
//   - Listener "finish" chạy SAU KHI toàn bộ chain hoàn tất —
//     lúc đó authMiddleware trong router con đã gắn req.user rồi.
//   - Nếu req.user vẫn undefined (public route) → listener tự skip.
//
// Các route KHÔNG bị log (tự skip bên trong middleware):
//   - GET requests (chỉ log mutation: POST/PUT/PATCH/DELETE)
//   - /auth/*    (login/register có auditLoginHistory riêng)
//   - /audit/*   (chính nó)
//   - /notifications/*/read* (đánh dấu đọc)
//   - /fcm-token (lưu push token)
// ─────────────────────────────────────────────────────────────────────────────
router.use(auditMiddleware);

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

// ===== AI Content =====
router.use("/ai-content", aiContentRoute);

// ===== AI Compare =====
router.use("/ai-compare", aiCompareRouter);

// ===== Search =====
router.use("/search", searchRoutes);

// ===== Notification =====
router.use("/notifications", notificationRoutes);

// ===== Analytics =====
router.use("/analytics", analyticsRouter);

// ===== Category Variant =====
router.use("/category-variant-attributes", categoryVariantAttributeRoute);

// ===== Settings & Audit =====
router.use("/settings", settingsRouter);

router.use("/audit", auditRouter);

router.use("/admin/staff-permissions", staffPermissionsRouter);

// Warm cache khi app khởi động
initSettingsCache().catch(console.error);

export default router;
