import { PrismaClient } from "@prisma/client";
import { userAddressesData } from "../seed-data/users-addresses";

interface SeedUserAddressesParams {
  users: {
    admin: any;
    staff?: any;
    customers: any[];
  };
}

export async function seedUserAddresses(
  prisma: PrismaClient,
  { users }: SeedUserAddressesParams
) {
  console.log("🌱 Seeding User Addresses...");

  const targetUser = users.customers?.[0] || users.admin;
  if (!targetUser) {
    console.warn("  ⚠️  No users found, skipping addresses");
    return;
  }

  let createdCount = 0;

  for (const addrData of userAddressesData) {
    try {
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
          provinceCode: addrData.provinceCode,
          provinceName: addrData.provinceName,
          wardCode: addrData.wardCode,
          wardName: addrData.wardName,
          detailAddress: addrData.detailAddress,
          type: addrData.type,
          isDefault: addrData.isDefault,
        },
        create: {
          userId: targetUser.id,
          contactName: addrData.contactName,
          phone: addrData.phone,
          provinceCode: addrData.provinceCode,
          provinceName: addrData.provinceName,
          wardCode: addrData.wardCode,
          wardName: addrData.wardName,
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