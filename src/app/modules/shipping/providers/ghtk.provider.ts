import { ShipmentStatus } from "@prisma/client";
import { BadRequestError } from "@/errors";
import {
  ShippingProviderAdapter,
  CreateShipmentPayload,
  CreateShipmentResult,
  ShipmentStatusResult,
} from "../shipping.types";

// ============================================================
// GHTK (Giao Hàng Tiết Kiệm) — https://docs.giaohangtietkiem.vn
// Chưa triển khai đầy đủ trong đợt 6 ngày này (xem timeline §6 — làm nếu kịp sau GHN).
// Khung sẵn theo đúng interface chung để cắm vào provider registry mà không phải sửa
// service/controller khi triển khai thật.
//
// ENV dự kiến cần:
//   GHTK_TOKEN=...
//   GHTK_BASE_URL=https://services.giaohangtietkiem.vn (prod) | https://services.giaohangtietkiem.vn/services-express (sandbox)
// ============================================================

const GHTK_STATUS_MAP: Record<string, ShipmentStatus> = {
  "1": "CREATED", // chưa tiếp nhận
  "2": "PICKED_UP", // đã tiếp nhận
  "3": "IN_TRANSIT", // đã lấy hàng / đang giao
  "4": "IN_TRANSIT", // đang giao hàng
  "5": "DELIVERED", // đã giao hàng
  "6": "CANCELLED", // đã huỷ
  "7": "FAILED", // không lấy được hàng
  "8": "FAILED", // hoãn lấy hàng
  "9": "IN_TRANSIT", // đang lấy hàng
  "10": "RETURNED", // đã điều phối giao hàng - chờ giao
  "11": "IN_TRANSIT",
  "12": "RETURNED", // giao hàng thất bại, chờ trả
  "13": "RETURNED", // đã trả hàng
  "20": "FAILED", // shop huỷ đơn
  "123": "RETURNED",
};

export class GhtkProvider implements ShippingProviderAdapter {
  readonly code = "GHTK" as const;

  async createShipment(_payload: CreateShipmentPayload): Promise<CreateShipmentResult> {
    // TODO: gọi POST /services/shipment/order (xem docs GHTK) khi tới lượt triển khai.
    throw new BadRequestError("Provider GHTK chưa được triển khai — xem TODO trong ghtk.provider.ts", "GHTK_NOT_IMPLEMENTED");
  }

  async getStatus(_providerOrderCode: string): Promise<ShipmentStatusResult> {
    // TODO: gọi GET /services/shipment/v2/{label_id}
    throw new BadRequestError("Provider GHTK chưa được triển khai", "GHTK_NOT_IMPLEMENTED");
  }

  async cancelShipment(_providerOrderCode: string): Promise<void> {
    // TODO: gọi POST /services/shipment/cancel
    throw new BadRequestError("Provider GHTK chưa được triển khai", "GHTK_NOT_IMPLEMENTED");
  }

  mapWebhookStatus(webhookBody: any) {
    const providerOrderCode = webhookBody?.label_id || webhookBody?.partner_id;
    const statusCode = String(webhookBody?.status_id ?? "");

    if (!providerOrderCode || !statusCode) return null;

    return {
      providerOrderCode,
      status: GHTK_STATUS_MAP[statusCode] ?? "IN_TRANSIT",
      rawPayload: webhookBody,
    };
  }
}

export const ghtkProvider = new GhtkProvider();
