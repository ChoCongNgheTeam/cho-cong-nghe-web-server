/*
  Warnings:

  - A unique constraint covering the columns `[name,parentId]` on the table `categories` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "TargetType" ADD VALUE 'PRODUCT_VARIANT';

-- DropIndex
DROP INDEX "categories_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_parentId_key" ON "categories"("name", "parentId");
