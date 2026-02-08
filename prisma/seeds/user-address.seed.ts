import { PrismaClient, AddressType } from "@prisma/client";

interface SeedUserAddressesParams {
  users: { admin: any; customers: any[] };
}

export async function seedUserAddresses(prisma: PrismaClient, { users }: SeedUserAddressesParams) {
  console.log(" 🌱 Seeding user addresses...");

  // 1. Lấy dữ liệu Tỉnh/Phường mẫu từ Database để đảm bảo Foreign Key hợp lệ (UUID)
  // Lấy tỉnh đầu tiên tìm thấy
  const validProvince = await prisma.provinces.findFirst();
  
  if (!validProvince) {
    console.warn("⚠️ Không tìm thấy bảng Provinces. Vui lòng seed Provinces trước.");
    return;
  }

  // Lấy một phường thuộc tỉnh đó
  const validWard = await prisma.wards.findFirst({
    where: { provinceId: validProvince.id }
  });

  if (!validWard) {
    console.warn("⚠️ Không tìm thấy bảng Wards. Vui lòng seed Wards trước.");
    return;
  }

  // 2. Định nghĩa dữ liệu mẫu (Sử dụng UUID thật vừa lấy được)
  const addressData = [
    {
      userEmail: "customer1@example.com",
      addresses: [
        {
          contactName: "Nguyễn Văn A",
          phone: "0901234567",
          provinceId: validProvince.id, // Dùng UUID thật
          wardId: validWard.id,         // Dùng UUID thật
          detailAddress: "123 Đường Láng, Đống Đa",
          type: AddressType.HOME,
          isDefault: true,
        },
        {
          contactName: "Công ty ABC",
          phone: "0281234567",
          provinceId: validProvince.id, 
          wardId: validWard.id,
          detailAddress: "456 Nguyễn Trãi, Quận 5",
          type: AddressType.OFFICE,
          isDefault: false,
        },
      ],
    },
    {
      userEmail: "customer2@example.com",
      addresses: [
        {
          contactName: "Trần Thị B",
          phone: "0909876543",
          provinceId: validProvince.id,
          wardId: validWard.id,
          detailAddress: "789 Lê Duẩn",
          type: AddressType.HOME,
          isDefault: true,
        },
      ],
    },
  ];

  let createdCount = 0;

  for (const item of addressData) {
    // Tìm user tương ứng trong danh sách đã seed trước đó
    const user = users.customers.find((u: any) => u.email === item.userEmail);
    
    // Nếu không tìm thấy user (do file seed user chưa tạo email này), bỏ qua để tránh lỗi
    if (!user) {
        console.warn(`⚠️ Skipping address for missing user: ${item.userEmail}`);
        continue;
    }

    for (const addr of item.addresses) {
      await prisma.user_addresses.upsert({
        where: {
          // Unique constraint composite: userId + detailAddress + phone
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
          // districtId: addr.districtId, // ĐÃ XÓA
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
          // districtId: addr.districtId, // ĐÃ XÓA
          wardId: addr.wardId,
          detailAddress: addr.detailAddress,
          type: addr.type,
          isDefault: addr.isDefault,
        },
      });
      createdCount++;
    }
  }

  console.log(`✅ Seeded ${createdCount} user addresses`);
}