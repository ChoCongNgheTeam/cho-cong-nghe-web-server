/*
  Warnings:

  - You are about to drop the column `brandImage` on the `brands` table. All the data in the column will be lost.
  - You are about to drop the column `categoryImage` on the `categories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "brands" DROP COLUMN "brandImage",
ADD COLUMN     "imagePath" TEXT,
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "categoryImage",
ADD COLUMN     "imagePath" TEXT,
ADD COLUMN     "imageUrl" TEXT;
