import { ShipmentStatus } from "@prisma/client";

// ============================================================
// Interface chung mà mọi provider (GHN/GHTK/Viettel Post) phải implement.
// Thêm provider mới sau này chỉ cần viết 1 class implement interface này,
// không phải sửa service/controller.
// ============================================================

export type ShippingProviderCode = "GHN" | "GHTK" | "VTP";

export interface CreateShipmentPayload {
  orderId: string;
  orderCode: string;
  toName: string;
  toPhone: string;
  toAddress: string;
  toWardName: string;
  toDistrictName?: string;
  toProvinceName: string;
  codAmount: number; // tiền thu hộ (0 nếu đã thanh toán online)
  weightGram: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  note?: string;
}

export interface CreateShipmentResult {
  providerOrderCode: string;
  shippingFee?: number;
  expectedDeliveryAt?: Date;
  rawPayload: unknown;
}

export interface ShipmentStatusResult {
  status: ShipmentStatus;
  rawPayload: unknown;
}

export interface ShippingProviderAdapter {
  readonly code: ShippingProviderCode;

  createShipment(payload: CreateShipmentPayload): Promise<CreateShipmentResult>;

  getStatus(providerOrderCode: string): Promise<ShipmentStatusResult>;

  cancelShipment(providerOrderCode: string): Promise<void>;

  /**
   * Chuẩn hoá payload webhook thô của provider về ShipmentStatus dùng chung.
   * Mỗi provider có format webhook khác nhau nên tự xử lý riêng.
   */
  mapWebhookStatus(webhookBody: any): { providerOrderCode: string; status: ShipmentStatus; rawPayload: unknown } | null;
}

export interface BulkCreateShipmentResult {
  orderId: string;
  success: boolean;
  shipmentId?: string;
  providerOrderCode?: string;
  error?: string;
}
