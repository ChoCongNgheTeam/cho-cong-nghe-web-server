import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { OrderQuery } from "./order.validation";

// 1. CẬP NHẬT QUERY: Thêm brand, code, label và sắp xếp ảnh y hệt Cart
export const orderSelect = {
  id: true,
  orderCode: true,
  userId: true,
  paymentMethodId: true,
  voucherId: true,
  shippingAddressId: true,
  shippingContactName: true,
  shippingPhone: true,
  shippingProvince: true,
  shippingWard: true,
  shippingDetail: true,
  subtotalAmount: true,
  shippingFee: true,
  voucherDiscount: true,
  totalAmount: true,
  orderStatus: true,
  paymentStatus: true,
  orderDate: true,
  updatedAt: true,
  deletedAt: true,
  deletedBy: true,
  user: { select: { id: true, fullName: true, email: true, phone: true } },
  paymentMethod: { select: { id: true, name: true, description: true } },
  voucher: { select: { id: true, code: true, description: true } },
  bankTransferCode: true,
  bankTransferQrUrl: true,
  bankTransferContent: true,
  bankTransferExpiredAt: true,
  paymentExpiredAt: true,
  paymentRedirectUrl: true,
  orderItems: {
    select: {
      id: true,
      quantity: true,
      unitPrice: true,
      productVariant: {
        select: {
          id: true,
          code: true,
          price: true,
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              // Đã gỡ bỏ take: 1 để lấy toàn bộ ảnh phục vụ so khớp màu
              img: { select: { imageUrl: true, color: true } },
            },
          },
          variantAttributes: {
            select: {
              attributeOption: {
                select: { value: true, attribute: { select: { name: true } } },
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.ordersSelect;

// 2. HÀM FORMAT: Đập phẳng dữ liệu Order Item cho giống hệt Cart Item
export const formatOrderResponse = (order: any) => {
  if (!order) return order;

  return {
    ...order,
    orderItems: order.orderItems.map((item: any) => {
      // Logic quét màu sắc y hệt Cart
      const colorAttr = item.productVariant.variantAttributes.find((attr: any) => {
        const code = (attr.attributeOption.attribute?.code || "").toLowerCase();
        const name = (attr.attributeOption.attribute?.name || "").toLowerCase();
        return ["color", "màu", "màu sắc"].includes(code || name);
      });

      // Logic quét dung lượng y hệt Cart (nếu FE cần hiển thị)
      const storageAttr = item.productVariant.variantAttributes.find((attr: any) => {
        const code = (attr.attributeOption.attribute?.code || "").toLowerCase();
        const name = (attr.attributeOption.attribute?.name || "").toLowerCase();
        return ["storage", "dung lượng", "rom", "rom_capacity"].includes(code || name);
      });

      const colorValue = colorAttr?.attributeOption.value;

      // 2. Lọc ra MẢNG ẢNH chỉ chứa đúng màu của biến thể
      let filteredImages = item.productVariant.product.img;
      if (colorValue) {
        filteredImages = item.productVariant.product.img.filter((img: any) => img.color === colorValue);
      }

      // Fallback: Nếu lọc xong không có ảnh nào khớp, giữ lại 1 ảnh đầu tiên làm đại diện
      if (filteredImages.length === 0 && item.productVariant.product.img.length > 0) {
        filteredImages = [item.productVariant.product.img[0]];
      }

      // 3. Lấy link ảnh đầu tiên trong mảng đã lọc để gán cho trường `image` bên ngoài (FE tiện dùng)
      const finalImageUrl = filteredImages.length > 0 ? filteredImages[0].imageUrl : null;

      // TRẢ VỀ CẤU TRÚC PHẲNG (Flattened) GIỐNG HỆT CART
      return {
        ...item,
        productVariant: {
          ...item.productVariant,
          product: {
            ...item.productVariant.product,
            img: filteredImages, // 👈 Ghi đè mảng 30 ảnh thành mảng chỉ có ảnh đúng màu
          },
        },
        image: finalImageUrl,
      };
    }),
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
    where.OR = [{ orderCode: { contains: search, mode: "insensitive" } }, { shippingPhone: { contains: search } }, { shippingContactName: { contains: search, mode: "insensitive" } }];
  }

  const [data, total] = await Promise.all([prisma.orders.findMany({ where, skip, take: limit, select: orderSelect, orderBy: { orderDate: "desc" } }), prisma.orders.count({ where })]);

  return { data: data.map(formatOrderResponse), page, limit, total, totalPages: Math.ceil(total / limit) };
};

export const findAllArchivedOrders = async (query: OrderQuery) => {
  const { page = 1, limit = 20, search } = query;
  const skip = (page - 1) * limit;
  const where: Prisma.ordersWhereInput = { deletedAt: { not: null } };

  if (search) {
    where.OR = [{ orderCode: { contains: search, mode: "insensitive" } }, { shippingPhone: { contains: search } }];
  }

  const [data, total] = await Promise.all([prisma.orders.findMany({ where, skip, take: limit, select: orderSelect, orderBy: { deletedAt: "desc" } }), prisma.orders.count({ where })]);

  return { data: data.map(formatOrderResponse), page, limit, total, totalPages: Math.ceil(total / limit) };
};

export const findOrdersByUserId = async (userId: string) => {
  const orders = await prisma.orders.findMany({
    where: { userId, deletedAt: null },
    select: orderSelect,
    orderBy: { orderDate: "desc" },
  });
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

// Payment info select — chỉ lấy những field cần cho trang /order/{orderCode}/payment
const orderPaymentInfoSelect = {
  orderCode: true,
  totalAmount: true,
  paymentStatus: true,
  orderStatus: true,
  bankTransferQrUrl: true,
  bankTransferContent: true,
  bankTransferExpiredAt: true,
  paymentMethod: { select: { name: true, description: true } },
} satisfies Prisma.ordersSelect;

export const findOrderPaymentInfoByCode = async (orderCode: string, userId: string) => {
  // Dùng orderSelect đầy đủ để trả về đủ thông tin đơn hàng (giống getMyOrders)
  const order = await prisma.orders.findFirst({
    where: { orderCode, userId, deletedAt: null },
    select: orderSelect,
  });
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
