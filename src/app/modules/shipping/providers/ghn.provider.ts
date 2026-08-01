import axios from "axios";
import { ShipmentStatus } from "@prisma/client";
import { BadRequestError } from "@/errors";
import { resolveGhnAddressCodes } from "./ghn-address-resolver";
import { ShippingProviderAdapter, CreateShipmentPayload, CreateShipmentResult, ShipmentStatusResult } from "../shipping.types";

// ============================================================
// GHN (Giao Hàng Nhanh) — https://api.ghn.vn
// Docs: https://api.ghn.vn/home/docs/detail?id=59 (tạo đơn), id=61 (lấy trạng thái), id=60 (huỷ đơn)
//
// ENV cần có (không lưu token trong DB, đọc từ .env — xem ghi chú bảo mật ở ADMIN_PLAN §4.1):
//   GHN_TOKEN=...
//   GHN_SHOP_ID=...
//   GHN_BASE_URL=https://online-gateway.ghn.vn/shiip/public-api (prod) | https://dev-online-gateway.ghn.vn/shiip/public-api (sandbox)
//   GHN_FROM_DISTRICT_ID=... / GHN_FROM_WARD_CODE=...  (kho gửi mặc định — vẫn cần lấy 2 giá trị
//   này 1 lần thủ công qua GHN dashboard hoặc /master-data cho kho gửi, vì đây là địa chỉ cố định)
//
// Hệ thống hiện chỉ lưu địa chỉ 2 cấp (Tỉnh/Thành + Phường/Xã, theo đơn vị hành chính MỚI —
// giống provinces.open-api.vn v2 mà checkout đang dùng). GHN vẫn yêu cầu to_district_id +
// to_ward_code theo mã NỘI BỘ cũ của họ khi tạo đơn nên cần quy đổi qua resolveGhnAddressCodes()
// (xem chi tiết cách quy đổi trong ghn-address-resolver.ts).
// ============================================================

const GHN_BASE_URL = process.env.GHN_BASE_URL || "https://online-gateway.ghn.vn/shiip/public-api";
const GHN_TOKEN = process.env.GHN_TOKEN || "";
const GHN_SHOP_ID = process.env.GHN_SHOP_ID || "";

const ghnClient = axios.create({
  baseURL: GHN_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Token: GHN_TOKEN,
    ShopId: GHN_SHOP_ID,
  },
  timeout: 15000,
  // Quan trọng: GHN trả HTTP 4xx kèm message lỗi thật trong body (VD thiếu field,
  // sai mã ward...) — mặc định axios sẽ throw ngay khi thấy status 4xx và mình sẽ
  // KHÔNG đọc được data.message thật, chỉ còn "Request failed with status code 400"
  // chung chung. Cho phép mọi status <500 đi qua như response bình thường để tự
  // đọc `data.code`/`data.message` bên dưới; chỉ để lỗi 5xx (server GHN sập) mới throw.
  validateStatus: (status) => status < 500,
});

// Map trạng thái GHN -> ShipmentStatus dùng chung của hệ thống.
// Danh sách status_code đầy đủ: https://api.ghn.vn/home/docs/detail?id=76
const GHN_STATUS_MAP: Record<string, ShipmentStatus> = {
  ready_to_pick: "CREATED",
  picking: "CREATED",
  money_collect_picking: "CREATED",
  picked: "PICKED_UP",
  storing: "PICKED_UP",
  transporting: "IN_TRANSIT",
  sorting: "IN_TRANSIT",
  delivering: "IN_TRANSIT",
  money_collect_delivering: "IN_TRANSIT",
  delivered: "DELIVERED",
  delivery_fail: "FAILED",
  waiting_to_return: "RETURNED",
  return: "RETURNED",
  return_transporting: "RETURNED",
  return_sorting: "RETURNED",
  returning: "RETURNED",
  return_fail: "RETURNED",
  returned: "RETURNED",
  cancel: "CANCELLED",
  exception: "FAILED",
  damage: "FAILED",
  lost: "FAILED",
};

const mapGhnStatus = (statusCode: string): ShipmentStatus => GHN_STATUS_MAP[statusCode] ?? "IN_TRANSIT";

export class GhnProvider implements ShippingProviderAdapter {
  readonly code = "GHN" as const;

  async createShipment(payload: CreateShipmentPayload): Promise<CreateShipmentResult> {
    if (!GHN_TOKEN || !GHN_SHOP_ID) {
      throw new BadRequestError("Thiếu GHN_TOKEN hoặc GHN_SHOP_ID trong biến môi trường", "GHN_MISSING_CONFIG");
    }

    const { districtId, wardCode } = await resolveGhnAddressCodes(payload.toProvinceName, payload.toWardName);

    const fromDistrictId = Number(process.env.GHN_FROM_DISTRICT_ID);
    const fromWardCode = process.env.GHN_FROM_WARD_CODE;

    const body = {
      payment_type_id: payload.codAmount > 0 ? 2 : 1, // 1: shop trả phí ship, 2: người nhận trả (COD)
      note: payload.note || "",
      required_note: "KHONGCHOXEMHANG",
      client_order_code: payload.orderCode,
      to_name: payload.toName,
      to_phone: payload.toPhone,
      to_address: payload.toAddress,
      to_ward_code: wardCode,
      to_district_id: districtId,
      cod_amount: payload.codAmount,
      weight: payload.weightGram,
      from_district_id: fromDistrictId || undefined,
      from_ward_code: fromWardCode || undefined,
      service_type_id: 2, // 2 = giao hàng tiêu chuẩn (e-commerce)
      items: payload.items.map((it) => ({
        name: it.name,
        quantity: it.quantity,
        price: it.price,
      })),
    };

    const { data } = await ghnClient.post("/v2/shipping-order/create", body);

    if (data?.code !== 200) {
      throw new BadRequestError(data?.message || "Tạo vận đơn GHN thất bại", "GHN_CREATE_FAILED");
    }

    return {
      providerOrderCode: data.data.order_code,
      shippingFee: data.data.total_fee,
      expectedDeliveryAt: data.data.expected_delivery_time ? new Date(data.data.expected_delivery_time) : undefined,
      rawPayload: data,
    };
  }

  async getStatus(providerOrderCode: string): Promise<ShipmentStatusResult> {
    const { data } = await ghnClient.post("/v2/shipping-order/detail", {
      order_code: providerOrderCode,
    });

    if (data?.code !== 200) {
      throw new BadRequestError(data?.message || "Không lấy được trạng thái vận đơn GHN", "GHN_GET_STATUS_FAILED");
    }

    return {
      status: mapGhnStatus(data.data.status),
      rawPayload: data,
    };
  }

  async cancelShipment(providerOrderCode: string): Promise<void> {
    const { data } = await ghnClient.post("/v2/switch-status/cancel", {
      order_codes: [providerOrderCode],
    });

    if (data?.code !== 200) {
      throw new BadRequestError(data?.message || "Huỷ vận đơn GHN thất bại", "GHN_CANCEL_FAILED");
    }
  }

  mapWebhookStatus(webhookBody: any) {
    const providerOrderCode = webhookBody?.OrderCode || webhookBody?.order_code;
    const statusCode = webhookBody?.Status || webhookBody?.status;

    if (!providerOrderCode || !statusCode) return null;

    return {
      providerOrderCode,
      status: mapGhnStatus(statusCode),
      rawPayload: webhookBody,
    };
  }
}

export const ghnProvider = new GhnProvider();
