/*
  Warnings:

  - You are about to drop the column `actionType` on the `promotion_targets` table. All the data in the column will be lost.
  - You are about to drop the column `buyQuantity` on the `promotion_targets` table. All the data in the column will be lost.
  - You are about to drop the column `discountValue` on the `promotion_targets` table. All the data in the column will be lost.
  - You are about to drop the column `getQuantity` on the `promotion_targets` table. All the data in the column will be lost.
  - You are about to drop the column `giftProductVariantId` on the `promotion_targets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "promotion_targets" DROP COLUMN "actionType",
DROP COLUMN "buyQuantity",
DROP COLUMN "discountValue",
DROP COLUMN "getQuantity",
DROP COLUMN "giftProductVariantId";

-- CreateTable
CREATE TABLE "promotion_rules" (
    "id" UUID NOT NULL,
    "promotionId" UUID NOT NULL,
    "actionType" "PromotionActionType" NOT NULL,
    "discountValue" DECIMAL(10,2),
    "buyQuantity" INTEGER,
    "getQuantity" INTEGER,
    "giftProductVariantId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotion_rules_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "promotion_rules" ADD CONSTRAINT "promotion_rules_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
