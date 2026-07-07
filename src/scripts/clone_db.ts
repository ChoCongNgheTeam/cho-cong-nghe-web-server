import { PrismaClient, Prisma } from '@prisma/client';

const source = new PrismaClient({ datasources: { db: { url: process.env.SOURCE_DATABASE_URL } } });
const target = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function cloneDatabase() {
  console.log("Bắt đầu clone DB từ Render sang Supabase...");

  const models = Prisma.dmmf.datamodel.models;
  
  // Tắt kiểm tra khóa ngoại trên Supabase để insert tự do
  await target.$executeRawUnsafe(`SET session_replication_role = 'replica';`);

  try {
    for (const model of models) {
      // Bỏ qua các bảng vector mới tạo
      if (model.name.includes("_vector")) continue; 

      console.log(`Đang copy bảng: ${model.name}...`);
      
      const data = await (source as any)[model.name].findMany();
      
      if (data.length > 0) {
        await (target as any)[model.name].deleteMany(); // Xóa data cũ trên Supabase
        
        const batchSize = 500;
        for (let i = 0; i < data.length; i += batchSize) {
           const batch = data.slice(i, i + batchSize);
           // Prisma createMany throws error if batch has empty arrays, but here they are flat records.
           await (target as any)[model.name].createMany({ data: batch, skipDuplicates: true });
        }
        console.log(`-> Đã copy ${data.length} dòng cho bảng ${model.name}`);
      } else {
        console.log(`-> Bảng ${model.name} trống.`);
      }
    }
    console.log("🎉 Clone hoàn tất toàn bộ dữ liệu!");
  } catch (err) {
    console.error("❌ Lỗi khi clone:", err);
  } finally {
    // Bật lại kiểm tra khóa ngoại
    await target.$executeRawUnsafe(`SET session_replication_role = 'origin';`);
    await source.$disconnect();
    await target.$disconnect();
  }
}

cloneDatabase();
