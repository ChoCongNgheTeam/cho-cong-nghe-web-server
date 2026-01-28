import { PrismaClient, AddressType } from "@prisma/client";

interface SeedUserAddressesParams {
  users: { admin: any; customers: any[] };
}

const addressData = [
  {
    userEmail: "customer1@example.com",
    addresses: [
      {
        contactName: "Nguyễn Văn A",
        phone: "0901234567",
        provinceId: 1, // Hà Nội
        districtId: 1,
        wardId: 1,
        detailAddress: "123 Đường Láng, Đống Đa",
        type: AddressType.HOME,
        isDefault: true,
      },
      {
        contactName: "Công ty ABC",
        phone: "0281234567",
        provinceId: 79, // TP.HCM
        districtId: 760,
        detailAddress: "456 Nguyễn Trãi, Quận 5",
        type: AddressType.OFFICE,
        isDefault: false,
      },
    ],
  },
  // Cho customer thứ hai
  {
    userEmail: "customer2@example.com",
    addresses: [
      {
        contactName: "Trần Thị B",
        phone: "0909876543",
        provinceId: 48, // Đà Nẵng
        districtId: 490,
        wardId: 20200,
        detailAddress: "789 Lê Duẩn",
        type: AddressType.HOME,
        isDefault: true,
      },
    ],
  },
];

export async function seedUserAddresses(prisma: PrismaClient, { users }: SeedUserAddressesParams) {
  console.log(" 🌱 Seeding user addresses...");

  let createdCount = 0;

  for (const item of addressData) {
    const user = users.customers.find((u: any) => u.email === item.userEmail);
    if (!user) continue;

    for (const addr of item.addresses) {
      await prisma.user_addresses.upsert({
        where: {
          // Không có unique tự nhiên, dùng combo để tránh duplicate
          userId_detailAddress_phone: {
            userId: user.id,
            detailAddress: addr.detailAddress,
            phone: addr.phone,
          },
        },
        update: {
          contactName: addr.contactName,
          phone: addr.phone,
          provinceId: addr.provinceId,
          districtId: addr.districtId,
          wardId: addr.wardId,
          detailAddress: addr.detailAddress,
          type: addr.type,
          isDefault: addr.isDefault,
        },
        create: {
          userId: user.id,
          contactName: addr.contactName,
          phone: addr.phone,
          provinceId: addr.provinceId,
          districtId: addr.districtId,
          wardId: addr.wardId,
          detailAddress: addr.detailAddress,
          type: addr.type,
          isDefault: addr.isDefault,
        },
      });
      createdCount++;
    }
  }

  console.log(`Seeded ${createdCount} user addresses`);
}
