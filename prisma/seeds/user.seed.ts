import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs"; // npm i bcryptjs @types/bcryptjs

const prisma = new PrismaClient();

const usersData = [
  {
    email: "admin@example.com",
    userName: "admin",
    passwordHash: bcrypt.hashSync("admin123", 10),
    fullName: "Quản trị viên",
    role: "ADMIN" as const,
    isActive: true,
  },
  {
    email: "staff@example.com",
    userName: "staff",
    passwordHash: bcrypt.hashSync("staff123", 10),
    fullName: "Nhân viên",
    role: "STAFF" as const,
  },
  {
    email: "customer1@example.com",
    userName: "khachhang1",
    passwordHash: bcrypt.hashSync("123456", 10),
    fullName: "Nguyễn Văn A",
    phone: "0901234567",
    gender: "MALE" as const,
    avatarImage: "./images/avatar.jpg",
    role: "CUSTOMER" as const,
  },
  {
    email: "customer2@example.com",
    userName: "khachhang2",
    passwordHash: bcrypt.hashSync("123456", 10),
    fullName: "Trần Thị B",
    phone: "0909876543",
    role: "CUSTOMER" as const,
  },
];

export async function seedUsers() {
  console.log("Seeding users...");

  const users = [];
  for (const data of usersData) {
    const user = await prisma.users.upsert({
      where: { email: data.email },
      update: {},
      create: data,
    });
    users.push(user);
  }

  console.log(`🚶‍➡️    Đã tạo ${users.length} users`);
  return {
    admin: users.find((u) => u.role === "ADMIN")!,
    staff: users.find((u) => u.role === "STAFF"),
    customers: users.filter((u) => u.role === "CUSTOMER"),
  };
}
