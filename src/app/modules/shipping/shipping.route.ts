import { Router } from "express";
import { authMiddleware } from "@/app/middlewares/auth.middleware";
import { requireRole } from "@/app/middlewares/role.middleware";
import { validate } from "@/app/middlewares/validate.middleware";
import { asyncHandler } from "@/utils/async-handler";
import { verifyShippingWebhookSecret } from "./shipping.webhook-auth";
import * as c from "./shipping.controller";
import { shipmentQuerySchema, eligibleOrdersQuerySchema, createShipmentSchema, bulkCreateShipmentSchema, bulkPrintLabelQuerySchema, upsertShippingProviderSchema } from "./shipping.validation";
import { STAFF_ROLES } from "@/app/modules/staff-permissions/staff-permissions.types";

const router = Router();

// ================== WEBHOOK (public — provider gọi vào, không có auth Bearer) ==================
// Các provider vận chuyển (GHN/GHTK/VTP) không có chuẩn HMAC signature thống nhất
// cho webhook. Cách phổ biến và được các provider hỗ trợ là nhúng 1 shared-secret
// tự chọn ngay trong URL webhook cấu hình trên dashboard của từng provider, VD:
//   https://api.example.com/api/v1/shipping/webhook/GHN?secret=<SHIPPING_WEBHOOK_SECRET_GHN>
// verifyShippingWebhookSecret() so khớp secret này (timing-safe) trước khi xử lý.
// Bắt buộc phải set secret trong .env VÀ trong URL webhook trên dashboard của
// từng provider trước khi lên production — xem ghi chú trong middleware.
router.post("/webhook/:providerCode", verifyShippingWebhookSecret, asyncHandler(c.providerWebhookHandler));

// ================== ADMIN ==================
router.use("/admin", authMiddleware(true), requireRole(...STAFF_ROLES, "ADMIN"));

router.get("/admin/providers/all", asyncHandler(c.listShippingProvidersHandler));
router.put("/admin/providers", validate(upsertShippingProviderSchema, "body"), asyncHandler(c.upsertShippingProviderHandler));

// Lưu ý thứ tự: "/all" và "/by-order/:orderId" phải đứng TRƯỚC "/:id" (cùng
// depth 1 segment với /all — Express match theo thứ tự đăng ký, để "/:id" sau
// cùng mới không "nuốt" mất các route cụ thể hơn).
router.get("/admin/shipments/all", validate(shipmentQuerySchema, "query"), asyncHandler(c.getAllShipmentsAdminHandler));
router.get("/admin/shipments/eligible-orders", validate(eligibleOrdersQuerySchema, "query"), asyncHandler(c.getEligibleOrdersHandler));
router.get("/admin/shipments/by-order/:orderId", asyncHandler(c.getShipmentByOrderHandler));
router.post("/admin/shipments/bulk", validate(bulkCreateShipmentSchema, "body"), asyncHandler(c.createBulkShipmentsHandler));
router.get("/admin/shipments/bulk-print", validate(bulkPrintLabelQuerySchema, "query"), asyncHandler(c.printBulkLabelsHandler));
router.post("/admin/shipments/:id/cancel", asyncHandler(c.cancelShipmentHandler));
router.get("/admin/shipments/:id", asyncHandler(c.getShipmentDetailHandler));

router.post("/admin/shipments", validate(createShipmentSchema, "body"), asyncHandler(c.createShipmentHandler));

export default router;
