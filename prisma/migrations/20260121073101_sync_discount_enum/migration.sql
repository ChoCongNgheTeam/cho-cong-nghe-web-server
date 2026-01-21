/*
  Warnings:

  - The values [PERCENTAGE,FIXED] on the enum `DiscountType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `voucher_actions` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `targetType` on the `voucher_targets` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TargetType" AS ENUM ('PRODUCT', 'CATEGORY', 'BRAND', 'ALL');

-- CreateEnum
CREATE TYPE "PromotionActionType" AS ENUM ('DISCOUNT_PERCENT', 'DISCOUNT_FIXED', 'BUY_X_GET_Y', 'GIFT_PRODUCT');

-- AlterEnum
BEGIN;
CREATE TYPE "DiscountType_new" AS ENUM ('DISCOUNT_PERCENT', 'DISCOUNT_FIXED');
ALTER TABLE "vouchers" ALTER COLUMN "discountType" TYPE "DiscountType_new" USING ("discountType"::text::"DiscountType_new");
ALTER TYPE "DiscountType" RENAME TO "DiscountType_old";
ALTER TYPE "DiscountType_new" RENAME TO "DiscountType";
DROP TYPE "DiscountType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "voucher_actions" DROP CONSTRAINT "voucher_actions_giftProductVariantId_fkey";

-- DropForeignKey
ALTER TABLE "voucher_actions" DROP CONSTRAINT "voucher_actions_voucherId_fkey";

-- AlterTable
ALTER TABLE "voucher_targets" DROP COLUMN "targetType",
ADD COLUMN     "targetType" "TargetType" NOT NULL;

-- DropTable
DROP TABLE "voucher_actions";

-- DropEnum
DROP TYPE "VoucherActionType";

-- CreateTable
CREATE TABLE "promotions" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_targets" (
    "id" UUID NOT NULL,
    "promotionId" UUID NOT NULL,
    "targetType" "TargetType" NOT NULL,
    "targetId" TEXT,
    "buyQuantity" INTEGER,
    "actionType" "PromotionActionType" NOT NULL,
    "discountValue" DECIMAL(10,2),
    "giftProductVariantId" UUID,
    "getQuantity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promotion_targets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "promotion_targets" ADD CONSTRAINT "promotion_targets_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
