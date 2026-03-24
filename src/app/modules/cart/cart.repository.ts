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
          category: {
            select: {
              id: true,
              slug: true,
              parent: {
                select: {
                  id: true,
                  slug: true,
                  parent: { select: { id: true, slug: true } },
                },
              },
            },
          },
          img: { select: { id: true, imageUrl: true, altText: true, color: true }, orderBy: { position: "asc" as any } },
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

export const create = async (data: { userId: string; productVariantId: string; quantity: number; unitPrice: number }) => {
  return prisma.cart_items.create({
    data,
    select: cartItemSelect,
  });
};

export const update = async (id: string, data: { productVariantId?: string; quantity?: number; unitPrice?: number }) => {
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
    return ["color", "màu", "màu sắc"].includes(code);
  });

  const storageAttr = item.productVariant.variantAttributes.find((attr: any) => {
    const code = (attr.attributeOption.attribute?.code || "").toLowerCase();
    return ["storage", "dung lượng", "rom", "rom_capacity"].includes(code);
  });

  const colorValue = colorAttr?.attributeOption.value;
  const matchingImage = item.productVariant.product.img.find((img: any) => img.color === colorValue);
  const finalImageUrl = matchingImage?.imageUrl || item.productVariant.product.img[0]?.imageUrl;

  const category = item.productVariant.product.category;
  const categoryPath: string[] = [];
  if (category) {
    categoryPath.push(category.id);
    if (category.parent) {
      categoryPath.push(category.parent.id);
      if (category.parent.parent) {
        categoryPath.push(category.parent.parent.id);
      }
    }
  }

  // ← THÊM: expose variantAttributes đã normalize
  const variantAttributes = item.productVariant.variantAttributes.map((va: any) => ({
    code: va.attributeOption.attribute?.code ?? "",
    value: va.attributeOption.value ?? "",
  }));

  return {
    id: item.id,
    productVariantId: item.productVariantId,
    productId: item.productVariant.product.id,
    productName: item.productVariant.product.name,
    productSlug: item.productVariant.product.slug,
    brandId: item.productVariant.product.brand.id,
    brandName: item.productVariant.product.brand.name,
    categoryId: category?.id,
    categoryPath: categoryPath.reverse(),
    variantCode: item.productVariant.code || undefined,
    variantAttributes, // ← thêm field này
    image: finalImageUrl,
    color: colorAttr?.attributeOption.label,
    colorValue,
    storage: storageAttr?.attributeOption.label,
    storageValue: storageAttr?.attributeOption.value,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    totalPrice: item.quantity * Number(item.unitPrice),
    availableQuantity: item.productVariant.quantity || 0,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};
