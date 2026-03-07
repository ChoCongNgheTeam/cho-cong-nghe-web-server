import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const usersData = [
  {
    email: "admin@example.com",
    userName: "admin",
    dateOfBirth: new Date("1990-01-01"),
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

export async function seedUsers(prisma: PrismaClient) {
  console.log("🌱 Seeding users...");

  const users = [];
  for (const data of usersData) {
    const user = await prisma.users.upsert({
      where: { email: data.email },
      update: {
        userName: data.userName,
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        phone: data.phone,
        gender: data.gender,
        avatarImage: data.avatarImage,
      },
      create: data,
    });
    users.push(user);
  }

  console.log(`Seeded ${users.length} users`);
  return {
    admin: users.find((u) => u.role === "ADMIN")!,
    staff: users.find((u) => u.role === "STAFF"),
    customers: users.filter((u) => u.role === "CUSTOMER"),
  };
}
