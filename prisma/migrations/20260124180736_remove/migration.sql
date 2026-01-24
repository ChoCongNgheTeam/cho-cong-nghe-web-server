/*
  Warnings:

  - You are about to drop the column `weight` on the `products_variants` table. All the data in the column will be lost.
  - You are about to drop the `product_variant_images` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `promotions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "product_variant_images" DROP CONSTRAINT "product_variant_images_productVariantId_fkey";

-- AlterTable
ALTER TABLE "products_variants" DROP COLUMN "weight";

-- DropTable
DROP TABLE "product_variant_images";

-- CreateTable
CREATE TABLE "product_color_images" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "color" TEXT NOT NULL,
    "imagePath" TEXT NOT NULL,
    "imageUrl" TEXT,
    "altText" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_color_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_color_images_productId_color_idx" ON "product_color_images"("productId", "color");

-- CreateIndex
CREATE UNIQUE INDEX "product_color_images_productId_color_imagePath_key" ON "product_color_images"("productId", "color", "imagePath");

-- CreateIndex
CREATE UNIQUE INDEX "promotions_name_key" ON "promotions"("name");

-- AddForeignKey
ALTER TABLE "product_color_images" ADD CONSTRAINT "product_color_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
