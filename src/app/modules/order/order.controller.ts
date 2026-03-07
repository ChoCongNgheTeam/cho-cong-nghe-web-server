import { Request, Response } from "express";
import {
  getMyOrders,
  getOrderDetail,
  getAllOrdersAdmin,
  updateOrderAdmin,
  deleteOrderAdmin,
  createOrderAdmin,
} from "./order.service";

// ================== PUBLIC (USER) ==================
export const getMyOrdersHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const orders = await getMyOrders(userId);
  res.json({
    data: orders,
    total: orders.length,
    message: "Lấy danh sách đơn hàng thành công",
  });
};

export const getOrderDetailHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const order = await getOrderDetail(id, userId);
  res.json({
    data: order,
    message: "Lấy chi tiết đơn hàng thành công",
  });
};

// ================== ADMIN ==================
export const getAllOrdersAdminHandler = async (req: Request, res: Response) => {
  const orders = await getAllOrdersAdmin();
  res.json({
    data: orders,
    total: orders.length,
    message: "Lấy tất cả đơn hàng thành công",
  });
};

export const getOrderAdminDetailHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await getOrderDetail(id);
  res.json({
    data: order,
    message: "Lấy chi tiết đơn hàng thành công",
  });
};

export const createOrderAdminHandler = async (req: Request, res: Response) => {
  const newOrder = await createOrderAdmin(req.body);
  
  res.status(201).json({
    data: newOrder,
    message: "Admin tạo đơn hàng hộ thành công",
  });
};

export const updateOrderAdminHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await updateOrderAdmin(id, req.body);
  res.json({
    data: order,
    message: "Cập nhật đơn hàng thành công",
  });
};

export const deleteOrderAdminHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  await deleteOrderAdmin(id);
  res.json({ message: "Xóa đơn hàng thành công" });
};