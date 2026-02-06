import prisma from "@/config/db";
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
      quantity: true,
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          brand: {
            select: { id: true, name: true },
          },
          img: {
            select: { id: true, imageUrl: true, altText: true },
          },
        },
      },
      variantAttributes: {
        select: {
          attributeOption: {
            select: {
              type: true,
              label: true,
              value: true,
            },
          },
        },
      },
    },
  },
};

/**
 * Lấy giỏ hàng theo userId
 */
export const findByUserId = async (userId: string) => {
  return prisma.cart_items.findMany({
    where: { userId },
    select: selectCartItem,
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Lấy một item cụ thể
 */
export const findById = async (cartItemId: string) => {
  return prisma.cart_items.findUnique({
    where: { id: cartItemId },
    select: selectCartItem,
  });
};

/**
 * Kiểm tra xem user đã có item này chưa
 */
export const findByUserAndVariant = async (
  userId: string,
  productVariantId: string
) => {
  return prisma.cart_items.findFirst({
    where: { userId, productVariantId },
    select: selectCartItem,
  });
};

/**
 * Tạo mới item trong DB
 */
export const create = async (data: {
  userId: string;
  productVariantId: string;
  quantity: number;
  unitPrice: number;
}) => {
  return prisma.cart_items.create({
    data: {
      userId: data.userId,
      productVariantId: data.productVariantId,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
    },
    select: selectCartItem,
  });
};

/**
 * Cập nhật item
 */
export const update = async (
  cartItemId: string,
  data: { quantity?: number; unitPrice?: number }
) => {
  return prisma.cart_items.update({
    where: { id: cartItemId },
    data: { ...data, updatedAt: new Date() },
    select: selectCartItem,
  });
};

/**
 * Xóa item
 */
export const remove = async (cartItemId: string) => {
  return prisma.cart_items.delete({
    where: { id: cartItemId },
    select: selectCartItem,
  });
};

/**
 * Xóa toàn bộ giỏ hàng của user
 */
export const clearCart = async (userId: string) => {
  return prisma.cart_items.deleteMany({
    where: { userId },
  });
};

/**
 * Transform helper
 */
export const transformToCartResponse = (
  item: CartItemWithProduct
): CartResponse => {
  const availableQuantity = item.productVariant.quantity || 0;

  const unitPrice =
    typeof item.unitPrice === "number"
      ? item.unitPrice
      : Number(item.unitPrice.toString());

  const colorAttribute = item.productVariant.variantAttributes.find(
    (attr: any) =>
      ["color", "màu"].includes((attr.attributeOption.type || "").toLowerCase())
  );

  return {
    id: item.id,
    productVariantId: item.productVariantId,
    productId: item.productVariant.product.id,
    productName: item.productVariant.product.name,
    productSlug: item.productVariant.product.slug,
    brandName: item.productVariant.product.brand.name,
    variantCode: item.productVariant.code || undefined,
    image: item.productVariant.product.img[0]?.imageUrl ?? undefined,
    color: colorAttribute?.attributeOption.label,
    colorValue: colorAttribute?.attributeOption.value,
    quantity: item.quantity,
    unitPrice,
    totalPrice: item.quantity * unitPrice,
    availableQuantity,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};