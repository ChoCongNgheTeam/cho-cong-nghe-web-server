import { PrismaClient } from "@prisma/client";

const methods = [
  {
    name: "COD",
    code: "COD",
    description: "Thanh toán khi nhận hàng",
  },
  {
    name: "Momo",
    code: "MOMO",
    description: "Ví điện tử MoMo",
  },
  {
    name: "VNPay",
    code: "VNPAY",
    description: "Ví điện tử VNPay",
  },
  {
    name: "ZaloPay",
    code: "ZALOPAY",
    description: "Ví ZaloPay",
  },
  {
    name: "Bank Transfer",
    code: "BANK_TRANSFER",
    description: "Chuyển khoản ngân hàng",
  },
  {
    name: "Credit Card",
    code: "CREDIT_CARD",
    description: "Thẻ tín dụng / ghi nợ",
  },
];

export async function seedPaymentMethods(prisma: PrismaClient) {
  console.log("🌱 Seeding payment methods...");

  for (const method of methods) {
    await prisma.payment_methods.upsert({
      where: { name: method.name },
      update: {
        description: method.description,
        code: method.code,
      },
      create: {
        ...method,
        isActive: true,
      },
    });
  }

  console.log(`Seeded ${methods.length} payment methods`);
}
