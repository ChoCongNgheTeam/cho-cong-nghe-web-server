import { pipeline } from '@xenova/transformers';
import { PrismaClient } from "@prisma/client";
import { env } from "@/config/env";

const prisma = new PrismaClient();

let extractor: any = null;

/**
 * Tạo vector embedding từ văn bản sử dụng all-MiniLM-L6-v2 (Local).
 */
export async function generateEmbedding(text: string, type: 'query' | 'passage' = 'passage'): Promise<number[]> {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', 'Xenova/multilingual-e5-small');
  }
  
  const prefixedText = `${type}: ${text.replace(/\n/g, " ")}`;
  const result = await extractor(prefixedText, { pooling: 'mean', normalize: true });
  return Array.from(result.data);
}

/**
 * Xây dựng chuỗi văn bản mô tả ngữ nghĩa cho một sản phẩm.
 */
export async function buildProductSemanticText(productId: string): Promise<string> {
  const product = await prisma.products.findUnique({
    where: { id: productId },
    include: {
      brand: true,
      category: true,
      productSpecifications: {
        include: { specification: true },
      },
      variants: {
        where: { isActive: true, deletedAt: null },
      }
    }
  });

  if (!product) throw new Error("Sản phẩm không tồn tại");

  let text = `Tên sản phẩm: ${product.name}. Hãng: ${product.brand.name}. Phân loại: ${product.category.name}. `;
  if (product.description) {
    // Chỉ lấy 500 ký tự đầu của description để tiết kiệm token
    text += `Mô tả: ${product.description.substring(0, 500)}. `;
  }

  // Thêm thông số kỹ thuật (rất quan trọng cho Semantic search)
  if (product.productSpecifications && product.productSpecifications.length > 0) {
    const specs = product.productSpecifications.map((s: any) => `${s.specification.name}: ${s.value}`).join(", ");
    text += `Cấu hình chi tiết: ${specs}. `;
  }

  // Thêm giá (lấy giá min/max của variants để ngữ nghĩa hiểu mức giá)
  if (product.variants && product.variants.length > 0) {
    const prices = product.variants.map((v: any) => Number(v.price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    text += `Mức giá tham khảo từ ${minPrice.toLocaleString('vi-VN')} đến ${maxPrice.toLocaleString('vi-VN')} VNĐ.`;
  }

  return text;
}

/**
 * Cập nhật vector embedding cho một sản phẩm.
 */
export async function syncProductEmbedding(productId: string): Promise<void> {
  try {
    const text = await buildProductSemanticText(productId);
    const embedding = await generateEmbedding(text);
    
    const formattedEmbedding = `[${embedding.join(",")}]`;
    await prisma.$executeRawUnsafe(
      `INSERT INTO products_vector ("productId", "content", "embedding", "updatedAt") 
       VALUES ($1::uuid, $2, $3::vector, NOW())
       ON CONFLICT ("productId") DO UPDATE 
       SET "content" = EXCLUDED."content", 
           "embedding" = EXCLUDED."embedding", 
           "updatedAt" = EXCLUDED."updatedAt"`,
      productId,
      text,
      formattedEmbedding
    );
    
    console.log(`[Sync] Đã cập nhật Vector cho sản phẩm: ${productId}`);
  } catch (error) {
    console.error(`[Sync] Lỗi khi tạo vector cho sản phẩm ${productId}:`, error);
  }
}

/**
 * Chạy đồng bộ toàn bộ sản phẩm (Dùng 1 lần hoặc chạy qua cronjob).
 */
export async function syncAllProducts(): Promise<void> {
  console.log("Bắt đầu đồng bộ Vector cho tất cả sản phẩm...");
  const products = await prisma.products.findMany({
    where: { isActive: true, deletedAt: null },
    select: { id: true, name: true }
  });

  let success = 0;
  for (const p of products) {
    try {
      await syncProductEmbedding(p.id);
      success++;
    } catch (e) {
      // Bỏ qua lỗi 1 SP để chạy tiếp
    }
    // Rate limit thủ công (nếu cần thiết) để tránh lỗi 429 Too Many Requests từ OpenAI
    await new Promise(r => setTimeout(r, 200)); 
  }
  
  console.log(`Đã đồng bộ xong ${success}/${products.length} sản phẩm.`);
}
