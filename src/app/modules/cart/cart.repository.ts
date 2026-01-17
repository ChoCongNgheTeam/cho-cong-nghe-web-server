import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { CartResponse, CartItemWithProduct } from "./cart.types";

const selectCartItem = {
  id: true,
  userId: true,
  productVariantId: true,
  quantity: true,
  unitPrice: true,
  createdAt: true,
  updatedAt: true,
  productVariant: {
    select: {
      id: true,
      code: true,
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          brand: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      images: {
        select: {
          id: true,
          imageUrl: true,
          altText: true,
        },
      },
      inventory: {
        select: {
          quantity: true,
          reservedQuantity: true,
        },
      },
    },
  },
};

/**
 * Lấy tất cả item trong giỏ hàng của user
 */
export const findByUserId = async (userId: string) => {
  return prisma.cart_items.findMany({
    where: { userId },
    select: selectCartItem,
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Lấy một item trong giỏ hàng
 */
export const findById = async (cartItemId: string) => {
  return prisma.cart_items.findUnique({
    where: { id: cartItemId },
    select: selectCartItem,
  });
};

/**
 * Kiểm tra xem item đã có trong giỏ hàng hay chưa
 */
export const findByUserAndVariant = async (
  userId: string,
  productVariantId: string
) => {
  return prisma.cart_items.findFirst({
    where: {
      userId,
      productVariantId,
    },
    select: selectCartItem,
  });
};

/**
 * Thêm sản phẩm vào giỏ hàng
 */
export const create = async (data: {
  userId: string;
  productVariantId: string;
  quantity: number;
  unitPrice: number;
}) => {
  return prisma.cart_items.create({
    data,
    select: selectCartItem,
  });
};

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 */
export const update = async (
  cartItemId: string,
  data: {
    quantity?: number;
    unitPrice?: number;
  }
) => {
  return prisma.cart_items.update({
    where: { id: cartItemId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
    select: selectCartItem,
  });
};

/**
 * Xóa một item khỏi giỏ hàng
 */
export const remove = async (cartItemId: string) => {
  return prisma.cart_items.delete({
    where: { id: cartItemId },
    select: selectCartItem,
  });
};

/**
 * Xóa tất cả item trong giỏ hàng của user
 */
export const clearCart = async (userId: string) => {
  return prisma.cart_items.deleteMany({
    where: { userId },
  });
};

/**
 * Xóa các item có trong danh sách (dùng khi tạo đơn hàng)
 */
export const removeByIds = async (cartItemIds: string[]) => {
  return prisma.cart_items.deleteMany({
    where: {
      id: { in: cartItemIds },
    },
  });
};

/**
 * Transform cart item để trả về response
 */
export const transformToCartResponse = (
  item: CartItemWithProduct
): CartResponse => {
  const availableQuantity = item.productVariant.inventory
    ? item.productVariant.inventory.quantity -
      item.productVariant.inventory.reservedQuantity
    : 0;

  const unitPrice = Number(item.unitPrice);

  return {
    id: item.id,
    productVariantId: item.productVariantId,
    productId: item.productVariant.product.id,
    productName: item.productVariant.product.name,
    productSlug: item.productVariant.product.slug,
    brandName: item.productVariant.product.brand.name,
    variantCode: item.productVariant.code || undefined,
    image: item.productVariant.images[0]?.imageUrl,
    quantity: item.quantity,
    unitPrice,
    totalPrice: item.quantity * unitPrice,
    availableQuantity,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

/**
 * Lấy giỏ hàng với tính năng paginate
 */
export const findByUserIdPaginated = async (
  userId: string,
  skip: number,
  take: number
) => {
  const [items, total] = await Promise.all([
    prisma.cart_items.findMany({
      where: { userId },
      select: selectCartItem,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.cart_items.count({
      where: { userId },
    }),
  ]);

  return { items, total };
};
