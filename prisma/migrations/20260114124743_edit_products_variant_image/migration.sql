/*
  Warnings:

  - Added the required column `imagePath` to the `product_variant_images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "product_variant_images" ADD COLUMN     "imagePath" TEXT NOT NULL,
ALTER COLUMN "imageUrl" DROP NOT NULL;
