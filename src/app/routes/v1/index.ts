import { Router } from "express";

// ===== Home =====
import homeRouter from "@/app/modules/home/home.route"; // pending

// ===== Catalog =====
import categoryRoutes from "@/app/modules/category/category.route";
import brandRoutes from "@/app/modules/brand/brand.route";
import attributeRouter from "@/app/modules/attributes/attribute.route";
import specificationRouter from "@/app/modules/specifications/specification.route";
import categoryVariantAttributeRoute from "@/app/modules/category-variant/category-variant-attribute.route";

// ===== Product =====
import productRoutes from "@/app/modules/product/product.route";
import reviewRoutes from "@/app/modules/review/review.route";
import campaignRoutes from "@/app/modules/campaign/campaign.route";

// ===== Search =====
import searchRoutes from "@/app/modules/search/search.route";

// ===== Auth =====
import authRoutes from "@/app/modules/auth/auth.route";

// ===== User =====
import userRoutes from "@/app/modules/user/user.route";
import userAddressRoutes from "@/app/modules/user-address/user-address.route";
import wishlistRoutes from "@/app/modules/wishlist/wishlist.route";
import notificationRoutes from "@/app/modules/notification/notification.route";

// ===== Commerce =====
import cartRoutes from "@/app/modules/cart/cart.route";
import checkoutRouter from "@/app/modules/checkout/checkout.route";
import orderRoutes from "@/app/modules/order/order.route";
import paymentRoutes from "@/app/modules/payment/payment.route";
import voucherRoutes from "@/app/modules/voucher/voucher.route";
import promotionRoutes from "@/app/modules/promotion/promotion.route";

// ===== Content =====
import blogRouters from "@/app/modules/blog/blog.route";
import commentRoutes from "@/app/modules/comment/comment.route";
import blogWithCommentsRoutes from "@/app/modules/blog-with-comments/blog-with-comments.routes";
import pageRoutes from "@/app/modules/page/page.route";
import imageMediaRouter from "@/app/modules/image-media/media.route";
import uploadRoutes from "@/app/modules/upload/upload.route";

// ===== AI =====
import { chatbotRoute } from "@/app/modules/chatbot/chatbot.route";
import { aiContentRoute } from "@/app/modules/ai-content/ai-content.route";
import aiCompareRouter from "@/app/modules/ai-compare/ai-compare.router";
import trendForecastRouter from "@/app/modules/trend-forecast/trend-forecast.route";

// ===== Admin =====
import analyticsRouter from "@/app/modules/analytics/analytics.route";
import settingsRouter from "@/app/modules/settings/settings.route";
import auditRouter from "@/app/modules/audit/audit.route";
import staffPermissionsRouter from "@/app/modules/staff-permissions/staff-permissions.route";
import healthRouter from "@/app/modules/health/health.router";

// ===== Kho hàng (Inventory) =====
import warehouseRouter from "@/app/modules/warehouse/warehouse.route";
import supplierRouter from "@/app/modules/supplier/supplier.route";
import inventoryRouter from "@/app/modules/inventory/inventory.route";

// ===== Vòng quay may mắn (Spin Wheel) =====
import spinRouter from "@/app/modules/spin/spin.route";

// ===== Vận chuyển (Shipping) =====
import shippingRouter from "@/app/modules/shipping/shipping.route";

// ===== Gợi ý sản phẩm (Recommendation) =====
import recommendationRouter from "@/app/modules/recommendation/recommendation.route";

import { auditMiddleware } from "@/app/middlewares/audit.middleware";
import { initSettingsCache } from "@/app/modules/settings/settings.service";

const router = Router();

// Audit middleware — tự động ghi log mọi mutation có xác thực
router.use(auditMiddleware);

// ===== Home =====
router.use("/home", homeRouter);

// ===== Catalog =====
router.use("/categories", categoryRoutes);
router.use("/brands", brandRoutes);
router.use("/attributes", attributeRouter);
router.use("/specifications", specificationRouter);
router.use("/category-variant-attributes", categoryVariantAttributeRoute);

// ===== Product =====
router.use("/products", productRoutes);
router.use("/reviews", reviewRoutes);
router.use("/campaigns", campaignRoutes);

// ===== Search =====
router.use("/search", searchRoutes);

// ===== Auth =====
router.use("/auth", authRoutes);

// ===== User =====
router.use("/users", userRoutes);
router.use("/addresses", userAddressRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/notifications", notificationRoutes);

// ===== Commerce =====
router.use("/cart", cartRoutes);
router.use("/checkout", checkoutRouter);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/vouchers", voucherRoutes);
router.use("/promotions", promotionRoutes);

// ===== Content =====
router.use("/blogs", blogRouters);
router.use("/comments", commentRoutes);
router.use("/blog-with-comments", blogWithCommentsRoutes);
router.use("/pages", pageRoutes);
router.use("/media", imageMediaRouter);
router.use("/upload", uploadRoutes);

// ===== AI =====
router.use("/chatbot", chatbotRoute);
router.use("/ai-content", aiContentRoute);
router.use("/ai-compare", aiCompareRouter);
router.use("/trend-forecast", trendForecastRouter);

// ===== Admin =====
router.use("/analytics", analyticsRouter);
router.use("/settings", settingsRouter);
router.use("/audit", auditRouter);
router.use("/admin/staff-permissions", staffPermissionsRouter);

// ===== Kho hàng (Inventory) =====
router.use("/admin/warehouses", warehouseRouter);
router.use("/admin/suppliers", supplierRouter);
router.use("/admin/inventory", inventoryRouter);

// ===== Vòng quay may mắn (Spin Wheel) =====
// Router tự khai báo path đầy đủ (/admin/spin-prizes và /spin) nên mount ở gốc "/"
router.use("/", spinRouter);

// ===== Vận chuyển (Shipping) =====
// Router tự khai báo "/admin/..." + "/webhook/:providerCode" nên mount ở gốc "/shipping"
router.use("/shipping", shippingRouter);

// ===== Gợi ý sản phẩm (Recommendation) =====
router.use("/recommendation", recommendationRouter);

router.use("/health", healthRouter);

// Warm cache khi app khởi động
initSettingsCache().catch(console.error);

export default router;
