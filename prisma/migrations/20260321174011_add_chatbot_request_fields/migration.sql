/*
  Warnings:

  - The values [TERMS,SHIPPING,PAYMENT] on the enum `PolicyType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'REQUEST_PENDING';

-- AlterEnum
BEGIN;
CREATE TYPE "PolicyType_new" AS ENUM ('DATA_PRIVACY', 'DELIVERY', 'DELIVERY_INSTALLATION', 'INSTALLMENT', 'LOYALTY', 'MOBILE_NETWORK', 'PRIVACY', 'RETURN', 'TECHNICAL_SUPPORT', 'UNBOXING', 'WARRANTY');
ALTER TABLE "pages" ALTER COLUMN "policyType" TYPE "PolicyType_new" USING ("policyType"::text::"PolicyType_new");
ALTER TYPE "PolicyType" RENAME TO "PolicyType_old";
ALTER TYPE "PolicyType_new" RENAME TO "PolicyType";
DROP TYPE "PolicyType_old";
COMMIT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "isChatbotRequest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requestAcknowledgedAt" TIMESTAMP(3),
ADD COLUMN     "requestRejectionReason" TEXT;
