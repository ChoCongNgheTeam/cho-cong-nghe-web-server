import { Request, Response } from "express";
import {
  getMyOrders,
  getOrderDetail,
  createUserOrder,
  getAllOrdersAdmin,
  updateOrderAdmin,
  deleteOrderAdmin,
} from "./order.service";

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

export const createOrderHandler = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const order = await createUserOrder(userId, req.body);
  res.status(201).json({
    data: order,
    message: "Tạo đơn hàng thành công",
  });
};

// Admin
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
