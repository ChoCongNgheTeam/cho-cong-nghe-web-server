import { PrismaClient } from "@prisma/client";
import { provincesData, wardsData, userAddressesData } from "../seed-data/users-addresses";

interface SeedUserAddressesParams {
  users: {
    admin: any;
    staff?: any;
    customers: any[];
  };
}

export async function seedUserAddresses(prisma: PrismaClient, { users }: SeedUserAddressesParams) {
  console.log("🌱 Seeding Locations & Addresses...");

  // 1. SEED PROVINCES
  console.log("  📍 Seeding provinces...");
  const provinceMap = new Map<string, string>(); // code -> id

  for (const provinceData of provincesData) {
    const province = await prisma.provinces.upsert({
      where: { code: provinceData.code },
      update: {
        name: provinceData.name,
        fullName: provinceData.fullName,
        type: provinceData.type,
      },
      create: {
        code: provinceData.code,
        name: provinceData.name,
        fullName: provinceData.fullName,
        type: provinceData.type,
      },
    });
    provinceMap.set(provinceData.code, province.id);
  }
  console.log(`  ✅ Seeded ${provincesData.length} provinces`);

  // 2. SEED WARDS
  console.log("  🏘️  Seeding wards...");
  const wardMap = new Map<string, string>(); // code -> id

  for (const wardData of wardsData) {
    const provinceId = provinceMap.get(wardData.provinceCode);
    if (!provinceId) {
      console.warn(`  ⚠️  Province ${wardData.provinceCode} not found, skipping ward ${wardData.code}`);
      continue;
    }

    const ward = await prisma.wards.upsert({
      where: { code: wardData.code },
      update: {
        name: wardData.name,
        fullName: wardData.fullName,
        type: wardData.type,
        provinceId,
      },
      create: {
        code: wardData.code,
        name: wardData.name,
        fullName: wardData.fullName,
        type: wardData.type,
        provinceId,
      },
    });
    wardMap.set(wardData.code, ward.id);
  }
  console.log(`  ✅ Seeded ${wardsData.length} wards`);

  // 3. SEED USER ADDRESSES
  console.log("  📬 Seeding user addresses...");
  let createdCount = 0;

  for (const addrData of userAddressesData) {
    try {
      // Tìm user (ưu tiên customer, nếu không có thì admin)
      let targetUser = users.customers?.[0] || users.admin;

      if (!targetUser) {
        console.warn("  ⚠️  No users found, skipping addresses");
        continue;
      }

      // Lấy provinceId và wardId dari maps
      const provinceId = provinceMap.get(addrData.provinceCode);
      const wardId = wardMap.get(addrData.wardCode);

      if (!provinceId || !wardId) {
        console.warn(
          `  ⚠️  Province ${addrData.provinceCode} or Ward ${addrData.wardCode} not found, skipping address`
        );
        continue;
      }

      await prisma.user_addresses.upsert({
        where: {
          userId_detailAddress_phone: {
            userId: targetUser.id,
            detailAddress: addrData.detailAddress,
            phone: addrData.phone,
          },
        },
        update: {
          contactName: addrData.contactName,
          phone: addrData.phone,
          provinceId,
          wardId,
          detailAddress: addrData.detailAddress,
          type: addrData.type,
          isDefault: addrData.isDefault,
        },
        create: {
          userId: targetUser.id,
          contactName: addrData.contactName,
          phone: addrData.phone,
          provinceId,
          wardId,
          detailAddress: addrData.detailAddress,
          type: addrData.type,
          isDefault: addrData.isDefault,
        },
      });
      createdCount++;
    } catch (error) {
      console.warn(`  ⚠️  Error seeding address for ${addrData.contactName}:`, error);
    }
  }

  console.log(`✅ Seeded ${createdCount} user addresses`);
}
