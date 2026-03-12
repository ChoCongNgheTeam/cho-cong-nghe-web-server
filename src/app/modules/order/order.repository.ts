import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { OrderQuery } from "./order.validation";

// 1. CẬP NHẬT QUERY: Thêm brand, code, label và sắp xếp ảnh y hệt Cart
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
              brand: { select: { id: true, name: true } }, // Bổ sung brand
              // Bổ sung sắp xếp ảnh để fallback luôn lấy đúng ảnh bìa
              img: { select: { imageUrl: true, color: true }, orderBy: { position: "asc" as any } } 
            } 
          },
          variantAttributes: { 
            select: { 
              attributeOption: { 
                // Bổ sung label và code để so khớp giống Cart
                select: { label: true, value: true, attribute: { select: { name: true, code: true } } } 
              } 
            } 
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

      // Tìm ảnh khớp màu
      const matchingImage = item.productVariant.product.img.find(
        (img: any) => img.color === colorValue
      );

      // Fallback: Lấy ảnh bìa đầu tiên (đã được sắp xếp bằng position asc)
      const finalImageUrl = matchingImage?.imageUrl || item.productVariant.product.img[0]?.imageUrl || null;

      // TRẢ VỀ CẤU TRÚC PHẲNG (Flattened) GIỐNG HỆT CART
      return {
        id: item.id,
        productVariantId: item.productVariantId,
        productId: item.productVariant.product.id,
        productName: item.productVariant.product.name,
        productSlug: item.productVariant.product.slug,
        brandName: item.productVariant.product.brand?.name,
        variantCode: item.productVariant.code || undefined,
        image: finalImageUrl,
        color: colorAttr?.attributeOption.label || colorAttr?.attributeOption.value,
        colorValue: colorValue,
        storage: storageAttr?.attributeOption.label || storageAttr?.attributeOption.value,
        storageValue: storageAttr?.attributeOption.value,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        subtotal: item.quantity * Number(item.unitPrice),
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

  return { data: data.map(formatOrderResponse), page, limit, total, totalPages: Math.ceil(total / limit) };
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