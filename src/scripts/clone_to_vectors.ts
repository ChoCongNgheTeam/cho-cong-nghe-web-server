import { PrismaClient } from "@prisma/client";
import { generateEmbedding, buildProductSemanticText } from "../app/modules/chatbot/sync/embedding.sync";

const prisma = new PrismaClient();

async function cloneProductsToVector() {
  console.log("Bắt đầu clone Products sang bảng products_vector...");
  
  const products = await prisma.products.findMany({
    where: { isActive: true, deletedAt: null },
    select: { id: true, name: true }
  });

  console.log(`Tìm thấy ${products.length} sản phẩm cần clone.`);

  let success = 0;
  for (const p of products) {
    try {
      // 1. Tạo chuỗi Semantic Text
      const text = await buildProductSemanticText(p.id);
      
      // 2. Insert/Update vào bảng products_vector
      await prisma.products_vector.upsert({
        where: { productId: p.id },
        update: { content: text },
        create: {
          productId: p.id,
          content: text,
        }
      });
      
      // 3. Tạo Vector và update bằng RAW SQL
      const embedding = await generateEmbedding(text);
      const formattedEmbedding = `[${embedding.join(",")}]`;
      
      await prisma.$executeRawUnsafe(
        `UPDATE products_vector SET embedding = $1::vector WHERE "productId" = $2`,
        formattedEmbedding,
        p.id
      );

      success++;
      console.log(`[${success}/${products.length}] Đã clone và nhúng xong: ${p.name}`);
    } catch (e) {
      console.error(`Lỗi khi clone SP ${p.id}:`, e);
    }
    
    // Rate limit 200ms để tránh bị OpenAI block
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`✅ Hoàn tất! Đã clone thành công ${success}/${products.length} sản phẩm.`);
}

async function main() {
  await cloneProductsToVector();
  await prisma.$disconnect();
}

main().catch(e => {
  console.error("Lỗi script:", e);
  process.exit(1);
});
