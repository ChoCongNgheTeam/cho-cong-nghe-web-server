/*
  Warnings:

  - The values [STAFF] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('CUSTOMER', 'ADMIN', 'SALES', 'MARKETING', 'SUPPORT', 'ACCOUNTING');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';
COMMIT;

-- CreateTable
CREATE TABLE "staff_permissions" (
    "userId" UUID NOT NULL,
    "canViewOrders" BOOLEAN NOT NULL DEFAULT false,
    "canCreateOrder" BOOLEAN NOT NULL DEFAULT false,
    "canUpdateOrder" BOOLEAN NOT NULL DEFAULT false,
    "canViewProducts" BOOLEAN NOT NULL DEFAULT false,
    "canUpdateStock" BOOLEAN NOT NULL DEFAULT false,
    "canBlogs" BOOLEAN NOT NULL DEFAULT false,
    "canMedia" BOOLEAN NOT NULL DEFAULT false,
    "canCampaigns" BOOLEAN NOT NULL DEFAULT false,
    "canVouchers" BOOLEAN NOT NULL DEFAULT false,
    "canPromotions" BOOLEAN NOT NULL DEFAULT false,
    "canAiContent" BOOLEAN NOT NULL DEFAULT false,
    "canReviews" BOOLEAN NOT NULL DEFAULT false,
    "canComments" BOOLEAN NOT NULL DEFAULT false,
    "canNotifications" BOOLEAN NOT NULL DEFAULT false,
    "canViewUsers" BOOLEAN NOT NULL DEFAULT false,
    "canAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "canPaymentView" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_permissions_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "staff_permissions" ADD CONSTRAINT "staff_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
