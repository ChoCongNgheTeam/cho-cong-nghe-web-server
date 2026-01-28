import { PrismaClient } from "@prisma/client";

const methods = [
  { name: "COD", description: "Thanh toán khi nhận hàng" },
  { name: "Momo", description: "Ví điện tử MoMo" },
  { name: "ZaloPay", description: "Ví ZaloPay" },
  { name: "Bank Transfer", description: "Chuyển khoản ngân hàng" },
  { name: "Credit Card", description: "Thẻ tín dụng / ghi nợ" },
];

export async function seedPaymentMethods(prisma: PrismaClient) {
  console.log(" 🌱 Seeding payment methods...");

  for (const method of methods) {
    await prisma.payment_methods.upsert({
      where: { name: method.name },
      update: {
        description: method.description,
      },
      create: { ...method, isActive: true },
    });
  }

  console.log(`Seeded ${methods.length} payment methods`);
}
