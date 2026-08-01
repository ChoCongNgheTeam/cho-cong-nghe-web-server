import prisma from "@/config/db";
import { NotFoundError, BadRequestError, ConflictError } from "@/errors";
import * as repo from "./shipping.repository";
import { getProviderAdapter } from "./providers";
import { generateBulkShipmentLabelsPdf } from "./shipping.pdf";
import { CreateShipmentInput, BulkCreateShipmentInput, ShipmentQuery, UpsertShippingProviderInput } from "./shipping.validation";
import { CreateShipmentPayload, BulkCreateShipmentResult } from "./shipping.types";

type OrderForShipment = {
  id: string;
  orderCode: string;
  shippingContactName: string;
  shippingPhone: string;
  shippingDetail: string;
  shippingWard: string;
  shippingProvince: string;
  totalAmount: any;
  paymentStatus: string;
  orderItems: Array<{
    quantity: number;
    unitPrice: any;
    productVariant: { code: string | null; product: { name: string } };
  }>;
};

const buildShipmentPayload = (order: OrderForShipment, weightGram: number, note?: string): CreateShipmentPayload => ({
  orderId: order.id,
  orderCode: order.orderCode,
  toName: order.shippingContactName,
  toPhone: order.shippingPhone,
  toAddress: order.shippingDetail,
  toWardName: order.shippingWard,
  toProvinceName: order.shippingProvince,
  codAmount: order.paymentStatus === "UNPAID" ? Number(order.totalAmount) : 0,
  weightGram,
  note,
  items: order.orderItems.map((item) => ({
    name: item.productVariant.product.name,
    quantity: item.quantity,
    price: Number(item.unitPrice),
  })),
});

export const listShipmentsAdmin = (query: ShipmentQuery) => repo.findAllShipmentsAdmin(query);

export const getShipmentDetail = async (id: string) => {
  const shipment = await repo.findShipmentById(id);
  if (!shipment) throw new NotFoundError("Vận đơn");
  return shipment;
};

export const getShipmentByOrder = async (orderId: string) => {
  const shipment = await repo.findShipmentByOrderId(orderId);
  if (!shipment) throw new NotFoundError("Vận đơn");
  return shipment;
};

export const listShippingProviders = () => repo.findAllShippingProviders();

export const upsertShippingProvider = (input: UpsertShippingProviderInput) =>
  repo.upsertShippingProvider(input.code, { name: input.name, isActive: input.isActive, config: input.config });

/** Tạo vận đơn cho 1 đơn hàng đơn lẻ. */
export const createShipmentForOrder = async (input: CreateShipmentInput) => {
  const order = await prisma.orders.findUnique({
    where: { id: input.orderId },
    select: {
      id: true,
      orderCode: true,
      shippingContactName: true,
      shippingPhone: true,
      shippingDetail: true,
      shippingWard: true,
      shippingProvince: true,
      totalAmount: true,
      paymentStatus: true,
      orderItems: {
        select: {
          quantity: true,
          unitPrice: true,
          productVariant: { select: { code: true, product: { select: { name: true } } } },
        },
      },
    },
  });
  if (!order) throw new NotFoundError("Đơn hàng");

  const existing = await repo.findShipmentByOrderId(order.id);
  if (existing) throw new ConflictError("Đơn hàng này đã có vận đơn", "SHIPMENT_ALREADY_EXISTS");

  const provider = await repo.findShippingProviderByCode(input.providerCode);
  if (!provider || !provider.isActive) {
    throw new BadRequestError(`Nhà vận chuyển "${input.providerCode}" chưa được kích hoạt`, "SHIPPING_PROVIDER_INACTIVE");
  }

  const adapter = getProviderAdapter(input.providerCode);
  const payload = buildShipmentPayload(order, input.weightGram, input.note);
  const result = await adapter.createShipment(payload);

  return repo.createShipmentRecord({
    orderId: order.id,
    providerId: provider.id,
    providerOrderCode: result.providerOrderCode,
    shippingFee: result.shippingFee,
    expectedDeliveryAt: result.expectedDeliveryAt,
    rawPayload: result.rawPayload,
  });
};

/**
 * Tạo vận đơn hàng loạt. Không dừng giữa chừng nếu 1 đơn lỗi — trả về kết quả
 * từng đơn (thành công/thất bại) để FE hiển thị chi tiết cho admin.
 */
export const createBulkShipments = async (input: BulkCreateShipmentInput): Promise<BulkCreateShipmentResult[]> => {
  const provider = await repo.findShippingProviderByCode(input.providerCode);
  if (!provider || !provider.isActive) {
    throw new BadRequestError(`Nhà vận chuyển "${input.providerCode}" chưa được kích hoạt`, "SHIPPING_PROVIDER_INACTIVE");
  }

  const eligibleOrders = await repo.findOrdersEligibleForShipment(input.orderIds);
  const eligibleIds = new Set(eligibleOrders.map((o) => o.id));
  const adapter = getProviderAdapter(input.providerCode);

  const results: BulkCreateShipmentResult[] = [];

  for (const orderId of input.orderIds) {
    if (!eligibleIds.has(orderId)) {
      results.push({ orderId, success: false, error: "Đơn hàng không tồn tại hoặc đã có vận đơn" });
      continue;
    }

    const order = eligibleOrders.find((o) => o.id === orderId)!;

    try {
      const payload = buildShipmentPayload(order, input.weightGram);
      const result = await adapter.createShipment(payload);
      const shipment = await repo.createShipmentRecord({
        orderId: order.id,
        providerId: provider.id,
        providerOrderCode: result.providerOrderCode,
        shippingFee: result.shippingFee,
        expectedDeliveryAt: result.expectedDeliveryAt,
        rawPayload: result.rawPayload,
      });
      results.push({ orderId, success: true, shipmentId: shipment.id, providerOrderCode: result.providerOrderCode });
    } catch (error: any) {
      results.push({ orderId, success: false, error: error?.message || "Lỗi không xác định" });
    }
  }

  return results;
};

export const cancelShipment = async (id: string) => {
  const shipment = await repo.findShipmentById(id);
  if (!shipment) throw new NotFoundError("Vận đơn");
  if (shipment.status === "DELIVERED") throw new BadRequestError("Vận đơn đã giao thành công, không thể huỷ");
  if (shipment.status === "CANCELLED") throw new BadRequestError("Vận đơn đã được huỷ trước đó");

  const adapter = getProviderAdapter(shipment.provider.code);
  if (shipment.providerOrderCode) {
    await adapter.cancelShipment(shipment.providerOrderCode);
  }

  return repo.updateShipmentStatus(id, { status: "CANCELLED" });
};

/** Webhook nhận cập nhật trạng thái từ 1 provider cụ thể. */
export const handleProviderWebhook = async (providerCode: string, webhookBody: any) => {
  const adapter = getProviderAdapter(providerCode);
  const mapped = adapter.mapWebhookStatus(webhookBody);
  if (!mapped) return null; // payload không hợp lệ hoặc không cần xử lý — bỏ qua êm, không throw để provider không retry vô ích

  const provider = await repo.findShippingProviderByCode(providerCode);
  if (!provider) return null;

  const shipment = await repo.findShipmentByProviderOrderCode(provider.id, mapped.providerOrderCode);
  if (!shipment) return null;

  const extra: { shippedAt?: Date; deliveredAt?: Date } = {};
  if (mapped.status === "PICKED_UP" && !shipment.shippedAt) extra.shippedAt = new Date();
  if (mapped.status === "DELIVERED") extra.deliveredAt = new Date();

  return repo.updateShipmentStatus(shipment.id, { status: mapped.status, rawPayload: mapped.rawPayload, ...extra });
};

export const printBulkLabels = async (shipmentIds: string[]) => {
  const shipments = await repo.findShipmentByIds(shipmentIds);
  if (shipments.length === 0) throw new NotFoundError("Vận đơn");
  return generateBulkShipmentLabelsPdf(shipments as any);
};
