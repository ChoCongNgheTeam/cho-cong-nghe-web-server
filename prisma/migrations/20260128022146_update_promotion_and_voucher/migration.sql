-- AlterTable
ALTER TABLE "promotions" ADD COLUMN     "maxDiscountValue" DECIMAL(12,2),
ADD COLUMN     "minOrderValue" DECIMAL(12,2),
ADD COLUMN     "usageLimit" INTEGER,
ADD COLUMN     "usedCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "vouchers" ADD COLUMN     "maxDiscountValue" DECIMAL(10,2);
