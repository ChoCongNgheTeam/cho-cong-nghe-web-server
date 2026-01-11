/*
  Warnings:

  - You are about to drop the `_categoriesToproducts` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `categoryId` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_categoriesToproducts" DROP CONSTRAINT "_categoriesToproducts_A_fkey";

-- DropForeignKey
ALTER TABLE "_categoriesToproducts" DROP CONSTRAINT "_categoriesToproducts_B_fkey";

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "categoryId" UUID NOT NULL;

-- DropTable
DROP TABLE "_categoriesToproducts";

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
