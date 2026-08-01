import { ShipmentStatus } from "@prisma/client";
import { BadRequestError } from "@/errors";
import {
  ShippingProviderAdapter,
  CreateShipmentPayload,
  CreateShipmentResult,
  ShipmentStatusResult,
} from "../shipping.types";

// ============================================================
// Viettel Post — https://api.viettelpost.vn
// Chưa triển khai đầy đủ trong đợt 6 ngày này (xem timeline §6 — làm nếu kịp sau GHN).
// Khung sẵn theo đúng interface chung để cắm vào provider registry mà không phải sửa
// service/controller khi triển khai thật.
//
// ENV dự kiến cần:
//   VTP_TOKEN=... (lấy qua API /v1/login trước, token hết hạn cần refresh)
//   VTP_BASE_URL=https://partner.viettelpost.vn/v2
// ============================================================

const VTP_STATUS_MAP: Record<number, ShipmentStatus> = {
  100: "CREATED", // đơn hàng mới nhập
  103: "PICKED_UP", // đã lấy hàng
  104: "IN_TRANSIT", // đang vận chuyển
  108: "DELIVERED", // phát thành công
  109: "FAILED", // phát không thành công
  115: "CANCELLED", // huỷ đơn hàng
  200: "RETURNED", // hoàn trả
};

export class ViettelPostProvider implements ShippingProviderAdapter {
  readonly code = "VTP" as const;

  async createShipment(_payload: CreateShipmentPayload): Promise<CreateShipmentResult> {
    // TODO: gọi POST /order/createOrder (xem docs Viettel Post) khi tới lượt triển khai.
    throw new BadRequestError(
      "Provider Viettel Post chưa được triển khai — xem TODO trong viettelpost.provider.ts",
      "VTP_NOT_IMPLEMENTED",
    );
  }

  async getStatus(_providerOrderCode: string): Promise<ShipmentStatusResult> {
    // TODO: gọi POST /order/getOrderStatus
    throw new BadRequestError("Provider Viettel Post chưa được triển khai", "VTP_NOT_IMPLEMENTED");
  }

  async cancelShipment(_providerOrderCode: string): Promise<void> {
    // TODO: gọi POST /order/UpdateOrder (action huỷ)
    throw new BadRequestError("Provider Viettel Post chưa được triển khai", "VTP_NOT_IMPLEMENTED");
  }

  mapWebhookStatus(webhookBody: any) {
    const providerOrderCode = webhookBody?.ORDER_NUMBER || webhookBody?.order_number;
    const statusCode = Number(webhookBody?.TYPE ?? webhookBody?.status_id);

    if (!providerOrderCode || !statusCode) return null;

    return {
      providerOrderCode,
      status: VTP_STATUS_MAP[statusCode] ?? "IN_TRANSIT",
      rawPayload: webhookBody,
    };
  }
}

export const viettelPostProvider = new ViettelPostProvider();
