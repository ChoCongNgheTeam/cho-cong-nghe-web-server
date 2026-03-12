import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { OrderQuery } from "./order.validation";

export const orderSelect = {
  id: true, orderCode: true, userId: true, paymentMethodId: true, voucherId: true,
  shippingAddressId: true, shippingContactName: true, shippingPhone: true,
  shippingProvince: true, shippingWard: true, shippingDetail: true,
  subtotalAmount: true, shippingFee: true, voucherDiscount: true, totalAmount: true,
  orderStatus: true, paymentStatus: true, orderDate: true, updatedAt: true,
  deletedAt: true, deletedBy: true,
  user: { select: { id: true, fullName: true, email: true, phone: true } },
  paymentMethod: { select: { id: true, name: true, description: true } },
  voucher: { select: { id: true, code: true, description: true } },
  orderItems: {
    select: {
      id: true, quantity: true, unitPrice: true,
      productVariant: {
        select: {
          id: true, code: true, price: true,
          product: { 
            select: { 
              id: true, 
              name: true, 
              slug: true, 
              // Đã gỡ bỏ take: 1 để lấy toàn bộ ảnh phục vụ so khớp màu
              img: { select: { imageUrl: true, color: true } } 
            } 
          },
          variantAttributes: { 
            select: { 
              attributeOption: { 
                select: { value: true, attribute: { select: { name: true } } } 
              } 
            } 
          },
        },
      },
    },
  },
} satisfies Prisma.ordersSelect;

// Hàm nội bộ: Xử lý chọn đúng hình ảnh theo variant màu sắc
export const formatOrderResponse = (order: any) => {
  if (!order) return order;
  
  return {
    ...order,
    orderItems: order.orderItems.map((item: any) => {
      // 1. Tìm màu sắc của variant
      const colorAttr = item.productVariant.variantAttributes.find((attr: any) => {
        const name = (attr.attributeOption.attribute?.name || "").toLowerCase();
        return ["color", "màu", "màu sắc"].includes(name);
      });

      const colorValue = colorAttr?.attributeOption.value;

      // 2. Tìm ảnh khớp với màu đó
      const matchingImage = item.productVariant.product.img.find(
        (img: any) => img.color === colorValue
      );

      // 3. Fallback: Nếu không có ảnh đúng màu, lấy ảnh đầu tiên của sản phẩm
      const finalImageUrl = matchingImage?.imageUrl || item.productVariant.product.img[0]?.imageUrl || null;

      // Trả về item gốc, nhét thêm trường `image` để FE sử dụng
      return {
        ...item,
        image: finalImageUrl 
      };
    })
  };
};

export const findAllOrders = async (query: OrderQuery) => {
  const { page = 1, limit = 20, search, status, paymentStatus, includeDeleted } = query;
  const skip = (page - 1) * limit;
  const where: Prisma.ordersWhereInput = {};

  if (!includeDeleted) where.deletedAt = null;
  if (status) where.orderStatus = status;
  if (paymentStatus) where.paymentStatus = paymentStatus;
  
  if (search) {
    where.OR = [
      { orderCode: { contains: search, mode: "insensitive" } },
      { shippingPhone: { contains: search } },
      { shippingContactName: { contains: search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.orders.findMany({ where, skip, take: limit, select: orderSelect, orderBy: { orderDate: "desc" } }),
    prisma.orders.count({ where }),
  ]);

  // Map lại dữ liệu
  const formattedData = data.map(formatOrderResponse);

  return { data: formattedData, page, limit, total, totalPages: Math.ceil(total / limit) };
};

export const findAllArchivedOrders = async (query: OrderQuery) => {
  const { page = 1, limit = 20, search } = query;
  const skip = (page - 1) * limit;
  const where: Prisma.ordersWhereInput = { deletedAt: { not: null } };

  if (search) {
    where.OR = [
      { orderCode: { contains: search, mode: "insensitive" } },
      { shippingPhone: { contains: search } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.orders.findMany({ where, skip, take: limit, select: orderSelect, orderBy: { deletedAt: "desc" } }),
    prisma.orders.count({ where }),
  ]);

  // Map lại dữ liệu
  const formattedData = data.map(formatOrderResponse);

  return { data: formattedData, page, limit, total, totalPages: Math.ceil(total / limit) };
};

export const findOrdersByUserId = async (userId: string) => {
  const orders = await prisma.orders.findMany({
    where: { userId, deletedAt: null },
    select: orderSelect,
    orderBy: { orderDate: "desc" },
  });

  // Map lại mảng đơn hàng
  return orders.map(formatOrderResponse);
};

export const findOrderById = async (id: string, includeDeleted = false) => {
  const order = await prisma.orders.findUnique({
    where: { id, ...(!includeDeleted ? { deletedAt: null } : {}) },
    select: orderSelect,
  });

  // Format object đơn lẻ
  return formatOrderResponse(order);
};

export const updateOrder = async (id: string, data: any) => {
  const order = await prisma.orders.update({ where: { id }, data, select: orderSelect });
  return formatOrderResponse(order);
};

// --- Archive & Delete ---
export const archiveOrder = async (id: string, adminId: string) => {
  return prisma.orders.update({
    where: { id },
    data: { deletedAt: new Date(), deletedBy: adminId },
  });
};

export const unarchiveOrder = async (id: string) => {
  return prisma.orders.update({
    where: { id },
    data: { deletedAt: null, deletedBy: null },
  });
};

export const hardDeleteOrderFromDb = async (id: string) => {
  return prisma.$transaction(async (tx) => {
    await tx.order_items.deleteMany({ where: { orderId: id } });
    return tx.orders.delete({ where: { id } });
  });
};