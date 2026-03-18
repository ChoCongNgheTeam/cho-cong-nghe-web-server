import { Request, Response } from "express";
import * as service from "./order.service";
import { orderQuerySchema } from "./order.validation";

// ================== PUBLIC (USER) ==================

export const getMyOrdersHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const orders = await service.getMyOrders(userId);
  res.json({ data: orders, total: orders.length, message: "Lấy danh sách đơn hàng thành công" });
};

export const getOrderDetailHandler = async (req: Request, res: Response) => {
  const order = await service.getOrderDetail(req.params.id, req.user?.id);
  res.json({ data: order, message: "Lấy chi tiết đơn hàng thành công" });
};

export const getOrderPaymentInfoHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const data = await service.getOrderPaymentInfo(req.params.orderCode, userId);
  res.json({ success: true, data, message: "Lấy thông tin thanh toán thành công" });
};

export const cancelOrderUserHandler = async (req: Request, res: Response) => {
  await service.cancelOrderUser(req.params.id, req.user!.id);
  res.json({ success: true, message: "Hủy đơn hàng thành công" });
};

export const reorderUserHandler = async (req: Request, res: Response) => {
  const result = await service.reorderUser(req.params.id, req.user!.id);
  res.json({
    success: true,
    data: result,
    message: result.outOfStockCount > 0 ? `Đã thêm ${result.addedCount} sản phẩm vào giỏ. Có ${result.outOfStockCount} sản phẩm đã hết hàng hoặc ngưng bán.` : "Đã thêm toàn bộ sản phẩm vào giỏ hàng.",
  });
};

// ================== STAFF & ADMIN ==================

export const getAllOrdersAdminHandler = async (req: Request, res: Response) => {
  const query = orderQuerySchema.parse(req.query);
  const result = await service.getAllOrdersAdmin(query);
  res.json({
    data: result.data,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      statusCounts: result.statusCounts,
    },
    message: "Lấy danh sách đơn hàng thành công",
  });
};

export const getOrderAdminDetailHandler = async (req: Request, res: Response) => {
  const order = await service.getOrderDetail(req.params.id);
  res.json({ data: order, message: "Lấy chi tiết đơn hàng thành công" });
};

export const updateOrderAdminHandler = async (req: Request, res: Response) => {
  const order = await service.updateOrderAdmin(req.params.id, req.body);
  res.json({ data: order, message: "Cập nhật trạng thái đơn hàng thành công" });
};

export const cancelOrderAdminHandler = async (req: Request, res: Response) => {
  await service.cancelOrderAdmin(req.params.id);
  res.json({ success: true, message: "Đã hủy đơn hàng và hoàn lại tồn kho" });
};

// ================== ADMIN ONLY ==================

export const createOrderAdminHandler = async (req: Request, res: Response) => {
  const newOrder = await service.createOrderAdmin(req.body);
  res.status(201).json({ data: newOrder, message: "Tạo đơn hàng hộ thành công" });
};
