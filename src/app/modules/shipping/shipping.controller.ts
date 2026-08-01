import { Request, Response } from "express";
import * as service from "./shipping.service";
import { ShipmentQuery, EligibleOrdersQuery } from "./shipping.validation";

// ================== ADMIN ==================

export const getAllShipmentsAdminHandler = async (req: Request, res: Response) => {
  const query = req.query as unknown as ShipmentQuery;
  const result = await service.listShipmentsAdmin(query);
  res.json({
    data: result.data,
    meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages, statusCounts: result.statusCounts },
    message: "Lấy danh sách vận đơn thành công",
  });
};

export const getShipmentDetailHandler = async (req: Request, res: Response) => {
  const shipment = await service.getShipmentDetail(req.params.id);
  res.json({ data: shipment, message: "Lấy chi tiết vận đơn thành công" });
};

export const getShipmentByOrderHandler = async (req: Request, res: Response) => {
  const shipment = await service.getShipmentByOrder(req.params.orderId);
  res.json({ data: shipment, message: "Lấy vận đơn theo đơn hàng thành công" });
};

export const getEligibleOrdersHandler = async (req: Request, res: Response) => {
  const query = req.query as unknown as EligibleOrdersQuery;
  const result = await service.listEligibleOrders(query);
  res.json({
    data: result.data,
    meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    message: "Lấy danh sách đơn hàng chưa có vận đơn thành công",
  });
};

export const createShipmentHandler = async (req: Request, res: Response) => {
  const shipment = await service.createShipmentForOrder(req.body);
  res.status(201).json({ data: shipment, message: "Tạo vận đơn thành công" });
};

export const createBulkShipmentsHandler = async (req: Request, res: Response) => {
  const results = await service.createBulkShipments(req.body);
  const successCount = results.filter((r) => r.success).length;
  res.status(207).json({
    data: results,
    message: `Đã tạo ${successCount}/${results.length} vận đơn thành công`,
  });
};

export const cancelShipmentHandler = async (req: Request, res: Response) => {
  const shipment = await service.cancelShipment(req.params.id);
  res.json({ data: shipment, message: "Đã huỷ vận đơn" });
};

export const printBulkLabelsHandler = async (req: Request, res: Response) => {
  const { shipmentIds } = req.query as unknown as { shipmentIds: string[] };
  const buffer = await service.printBulkLabels(shipmentIds);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="van-don-${Date.now()}.pdf"`);
  res.send(buffer);
};

export const listShippingProvidersHandler = async (_req: Request, res: Response) => {
  const providers = await service.listShippingProviders();
  res.json({ data: providers, message: "Lấy danh sách nhà vận chuyển thành công" });
};

export const upsertShippingProviderHandler = async (req: Request, res: Response) => {
  const provider = await service.upsertShippingProvider(req.body);
  res.json({ data: provider, message: "Cập nhật cấu hình nhà vận chuyển thành công" });
};

// ================== WEBHOOK (public, không auth) ==================

export const providerWebhookHandler = async (req: Request, res: Response) => {
  // Luôn trả 200 cho provider dù xử lý lỗi bên trong, tránh bị provider retry dồn dập.
  try {
    await service.handleProviderWebhook(req.params.providerCode, req.body);
  } catch (error) {
    console.error(`[Shipping Webhook] Lỗi xử lý webhook từ ${req.params.providerCode}:`, error);
  }
  res.status(200).json({ success: true });
};
