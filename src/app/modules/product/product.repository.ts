import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { ListProductsQuery } from "./product.validation";

const selectProduct = {
  id: true,
  name: true,
  description: true,
  slug: true,
  
  brand: { select: { id: true, name: true } },
  viewsCount: true,
  ratingAverage: true,
  ratingCount: true,
  isFeatured: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  productCategories: {
    select: {
      category: { select: { id: true, name: true, slug: true } },
      isPrimary: true,
    },
  },
  variants: {
    select: {
      id: true,
      code: true,
      price: true,
      weight: true,
      isDefault: true,
      isActive: true,
      inventory: { select: { quantity: true, reservedQuantity: true } },
      images: { select: { id: true, imageUrl: true, altText: true, position: true } },
      variantAttributes: {
        select: {
          id: true,
         
          attributeOption: {
            select: {
              id: true,
              attribute: { select: { id: true, name: true } },
              value: true,
            },
          },
          createdAt: true,
        },
      },
    },
  },
  // Đã sửa: Highlights -> highlights (viết thường để khớp với schema)
  highlights: {
    orderBy: { sortOrder: 'asc' as const }, 
    select: {
      value: true,
      highlight: {
        select: {
          id: true,
          key: true,
          title: true,
          icon: true,
        },
      },
    },
  },
};

const buildWhere = (query: ListProductsQuery, onlyActive: boolean) => {
  const where: Prisma.productsWhereInput = {};

  if (onlyActive) where.isActive = true;
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }
  // LOGIC MỚI: Lọc theo Category Slug (Tên trên URL)
  if (query.category) {
    where.productCategories = {
      some: {
        category: {
          slug: query.category // Lọc theo trường slug trong bảng Category
        }
      }
    };
  }
  if (query.categoryId) {
    where.productCategories = { some: { categoryId: query.categoryId } };
  }
  if (query.brandId) where.brandId = query.brandId;
  if (query.isFeatured !== undefined) where.isFeatured = query.isFeatured;

  return where;
};

export const findAllPublic = async (query: ListProductsQuery) => {
  return findAll(query, true);
};

export const findAllAdmin = async (query: ListProductsQuery) => {
  return findAll(query, false);
};

const findAll = async (query: ListProductsQuery, onlyActive: boolean) => {
  const { page, limit, sortBy, sortOrder } = query;
  const skip = (page - 1) * limit;

  const where = buildWhere(query, onlyActive);

  const [data, total] = await Promise.all([
    prisma.products.findMany({
      where,
      select: selectProduct,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.products.count({ where }),
  ]);

  return {
    data,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

export const findById = (id: string) =>
  prisma.products.findUnique({ where: { id }, select: selectProduct });

export const findBySlug = (slug: string) =>
  prisma.products.findUnique({ where: { slug }, select: selectProduct });

export const create = async (data: any) => {
  const { categories, variants, highlights, ...product } = data;

  return prisma.products.create({
    data: {
      ...product,
      productCategories: {
        createMany: {
          data: categories.map((c: any, i: number) => ({
            categoryId: c.id,
            isPrimary: i === 0,
          })),
        },
      },
      // Đã sửa: Highlights -> highlights
      highlights: {
        create: highlights?.map((h: any, index: number) => ({
          highlightId: h.highlightId,
          value: h.value,
          sortOrder: index, 
        })) || [],
      },
      variants: {
        create: variants.map((v: any) => ({
          code: v.code,
          price: v.price,
          weight: v.weight,
          isDefault: v.isDefault || false,
          inventory: {
            create: { quantity: v.quantity ?? 0 },
          },
          images: { 
            create: v.images?.map((img: any, idx: number) => ({
              imageUrl: img.imageUrl,
              // Nếu DB có cột publicId thì lưu, không thì bỏ dòng này
              // publicId: img.publicId, 
              altText: img.altText || data.name, // Nếu không có alt text thì lấy tên SP
              position: idx, // Lưu thứ tự hiển thị
            })) || [] 
          },
          variantAttributes: {
            create: v.variantAttributes?.map((attr: any) => ({
              attributeOptionId: attr.attributeOptionId,
            })) || []
          }
        })),
      },
    },
    select: selectProduct,
  });
};

export const update = async (id: string, data: any) => {
  // Xử lý Categories
  if (data.categories) {
    await prisma.product_categories.deleteMany({ where: { productId: id } });
    await prisma.product_categories.createMany({
      data: data.categories.map((c: any, i: number) => ({
        productId: id,
        categoryId: c.id,
        isPrimary: i === 0,
      })),
    });
    delete data.categories;
  }

  // Xử lý Highlights
  if (data.highlights) {
    // 1. Xóa các highlight cũ của sản phẩm
    await prisma.product_highlights.deleteMany({ where: { productId: id } });
    
    // 2. Tạo lại highlight mới
    if (data.highlights.length > 0) {
      await prisma.product_highlights.createMany({
        data: data.highlights.map((h: any, index: number) => ({
          productId: id,
          highlightId: h.highlightId,
          value: h.value,
          sortOrder: index,
        })),
      });
    }
    delete data.highlights;
  }

  return prisma.products.update({
    where: { id },
    data,
    select: selectProduct,
  });
};

export const remove = async (id: string) => {
  // Xóa dữ liệu liên quan trước khi xóa sản phẩm (theo thứ tự Foreign Key)
  // 1. Lấy tất cả variants của product
  const variants = await prisma.products_variants.findMany({
    where: { productId: id },
    select: { id: true },
  });

  // 2. Xóa images và attributes của các variants
  for (const variant of variants) {
    await prisma.product_variant_images.deleteMany({ where: { productVariantId: variant.id } });
    await prisma.variants_attributes.deleteMany({ where: { productVariantId: variant.id } });
  }

  // 3. Xóa inventory
  await prisma.inventory.deleteMany({ 
    where: { variant: { productId: id } } 
  });

  // 4. Xóa các variants
  await prisma.products_variants.deleteMany({ where: { productId: id } });
  
  // 5. Xóa categories và highlights
  await prisma.product_categories.deleteMany({ where: { productId: id } });
  await prisma.product_highlights.deleteMany({ where: { productId: id } });
  
  // 6. Xóa product
  return prisma.products.delete({ where: { id } });
};

// Lấy ảnh cũ của các variant theo product ID
export const getVariantImagesByProductId = async (productId: string) => {
  const product = await prisma.products.findUnique({
    where: { id: productId },
    include: {
      variants: {
        include: {
          images: {
            select: {
              id: true,
              imageUrl: true,
            },
          },
        },
      },
    },
  });

  if (!product) return [];

  return product.variants.flatMap(variant =>
    variant.images.map(img => ({
      id: img.id,
      imageUrl: img.imageUrl,
    }))
  );
};