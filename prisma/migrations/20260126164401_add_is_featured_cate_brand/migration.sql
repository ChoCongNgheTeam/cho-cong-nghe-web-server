-- AlterTable
ALTER TABLE "brands" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;
