import { PrismaClient } from "@prisma/client";
// Đảm bảo đường dẫn này đúng với tên file chứa dữ liệu của bạn
import { provincesData, wardsData, userAddressesData } from "../seed-data/users-addresses"; 

// SỬA Ở ĐÂY: Đổi 'any[]' thành 'any' để nhận được object { admin, staff... }
export async function seedUserAddresses(prisma: PrismaClient, context?: { users: any }) {
  console.log("🌱 Seeding Locations & Addresses...");

  // --- 1. SEED PROVINCES ---
  for (const province of provincesData) {
    await prisma.provinces.upsert({
      where: { code: province.code },
      update: {},
      create: province,
    });
  }
  console.log(`✅ Seeded ${provincesData.length} provinces`);

  // --- 2. SEED WARDS ---
  let wardsCount = 0;
  for (const ward of wardsData) {
    const province = await prisma.provinces.findUnique({
      where: { code: ward.provinceCode },
    });

    if (province) {
      await prisma.wards.upsert({
        where: { code: ward.code },
        update: {},
        create: {
          code: ward.code,
          name: ward.name,
          fullName: ward.fullName,
          type: ward.type,
          provinceId: province.id,
        },
      });
      wardsCount++;
    }
  }
  console.log(`✅ Seeded ${wardsCount} wards`);

  // --- 3. SEED USER ADDRESSES ---
  
  // LOGIC MỚI: Xử lý linh hoạt dù users là Array hay Object
  let user;
  if (context?.users) {
    if (Array.isArray(context.users) && context.users.length > 0) {
      // Trường hợp là Array
      user = context.users[0];
    } else if (typeof context.users === 'object') {
      // Trường hợp là Object { admin, staff, customer... }
      // Ưu tiên lấy customer hoặc admin, nếu không thì lấy user đầu tiên tìm thấy
      user = context.users.customer || context.users.admin || context.users.staff || Object.values(context.users)[0];
    }
  }

  // Fallback: Nếu không truyền hoặc không tìm thấy trong context thì query DB
  if (!user) {
    user = await prisma.users.findFirst(); 
  }

  if (!user) {
    console.warn("⚠️ Không tìm thấy User nào để seed địa chỉ. Hãy seed User trước!");
    return;
  }

  for (const address of userAddressesData) {
    const province = await prisma.provinces.findUnique({ where: { code: address.provinceCode } });
    const ward = await prisma.wards.findUnique({ where: { code: address.wardCode } });

    if (province && ward) {
      const exists = await prisma.user_addresses.findFirst({
        where: {
          userId: user.id,
          detailAddress: address.detailAddress,
        }
      });

      if (!exists) {
        await prisma.user_addresses.create({
          data: {
            userId: user.id,
            contactName: address.contactName,
            phone: address.phone,
            provinceId: province.id,
            wardId: ward.id,
            detailAddress: address.detailAddress,
            type: address.type,
            isDefault: address.isDefault,
          },
        });
        console.log(`   -> Created address for user: ${user.email || user.id} at ${address.provinceCode}`);
      }
    }
  }
  console.log("✅ Seeded user addresses successfully");
}