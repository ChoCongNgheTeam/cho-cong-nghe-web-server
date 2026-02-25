import prisma from "@/config/db";
import { CartResponse } from "./cart.types";

export const cartItemSelect = {
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
      price: true,
      isActive: true,
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          brand: { select: { id: true, name: true } },
          img: { select: { id: true, imageUrl: true, altText: true, color: true } },
        },
      },
      variantAttributes: {
        select: {
          attributeOption: {
            select: {
              label: true,
              value: true,
              attribute: { select: { name: true, code: true } },
            },
          },
        },
      },
    },
  },
};

export const findVariantWithProductById = async (variantId: string) => {
  return prisma.products_variants.findUnique({
    where: { id: variantId },
    include: { product: true },
  });
};

export const findByUserId = async (userId: string) => {
  return prisma.cart_items.findMany({
    where: { userId },
    select: cartItemSelect,
    orderBy: { createdAt: "desc" },
  });
};

export const findById = async (id: string) => {
  return prisma.cart_items.findUnique({
    where: { id },
    select: cartItemSelect,
  });
};

export const findByUserAndVariant = async (userId: string, variantId: string) => {
  return prisma.cart_items.findFirst({
    where: { userId, productVariantId: variantId },
    select: cartItemSelect,
  });
};

export const create = async (data: {
  userId: string;
  productVariantId: string;
  quantity: number;
  unitPrice: number;
}) => {
  return prisma.cart_items.create({
    data,
    select: cartItemSelect,
  });
};

export const update = async (id: string, data: { quantity?: number; unitPrice?: number }) => {
  return prisma.cart_items.update({
    where: { id },
    data: { ...data, updatedAt: new Date() },
    select: cartItemSelect,
  });
};

export const remove = async (id: string) => {
  return prisma.cart_items.delete({ where: { id } });
};

export const clearCart = async (userId: string) => {
  return prisma.cart_items.deleteMany({ where: { userId } });
};

export const transformToCartResponse = (item: any): CartResponse => {
  const colorAttr = item.productVariant.variantAttributes.find((attr: any) => {
    const code = (attr.attributeOption.attribute?.code || "").toLowerCase();
    const name = (attr.attributeOption.attribute?.name || "").toLowerCase();
    return ["color", "màu", "màu sắc"].includes(code || name);
  });

  const colorValue = colorAttr?.attributeOption.value;

  // BƯỚC 2: Tìm bức ảnh có trường color khớp với colorValue của Variant
  const matchingImage = item.productVariant.product.img.find(
    (img: any) => img.color === colorValue
  );

  // Nếu tìm thấy ảnh trùng màu thì lấy, nếu không (ví dụ sản phẩm không phân loại theo màu) thì fallback về ảnh đầu tiên
  const finalImageUrl = matchingImage?.imageUrl || item.productVariant.product.img[0]?.imageUrl;

  return {
    id: item.id,
    productVariantId: item.productVariantId,
    productId: item.productVariant.product.id,
    productName: item.productVariant.product.name,
    productSlug: item.productVariant.product.slug,
    brandName: item.productVariant.product.brand.name,
    variantCode: item.productVariant.code || undefined,
    image: finalImageUrl, // BƯỚC 3: Gán link ảnh đã lọc được
    color: colorAttr?.attributeOption.label,
    colorValue: colorValue,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    totalPrice: item.quantity * Number(item.unitPrice),
    availableQuantity: item.productVariant.quantity || 0,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};