/*
  Warnings:

  - You are about to drop the column `attributeId` on the `attributes_options` table. All the data in the column will be lost.
  - You are about to drop the `attributes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `category_attributes` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[type,value]` on the table `attributes_options` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `attributes_options` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "attributes_options" DROP CONSTRAINT "attributes_options_attributeId_fkey";

-- DropForeignKey
ALTER TABLE "category_attributes" DROP CONSTRAINT "category_attributes_attributeId_fkey";

-- DropForeignKey
ALTER TABLE "category_attributes" DROP CONSTRAINT "category_attributes_categoryId_fkey";

-- DropIndex
DROP INDEX "attributes_options_attributeId_value_key";

-- AlterTable
ALTER TABLE "attributes_options" DROP COLUMN "attributeId",
ADD COLUMN     "type" TEXT NOT NULL;

-- DropTable
DROP TABLE "attributes";

-- DropTable
DROP TABLE "category_attributes";

-- CreateIndex
CREATE UNIQUE INDEX "attributes_options_type_value_key" ON "attributes_options"("type", "value");
