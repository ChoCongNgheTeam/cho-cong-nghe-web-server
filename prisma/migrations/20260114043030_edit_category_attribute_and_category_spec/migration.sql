/*
  Warnings:

  - You are about to drop the `CategoryAttribute` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CategorySpecification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CategoryAttribute" DROP CONSTRAINT "CategoryAttribute_attributeId_fkey";

-- DropForeignKey
ALTER TABLE "CategoryAttribute" DROP CONSTRAINT "CategoryAttribute_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "CategorySpecification" DROP CONSTRAINT "CategorySpecification_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "CategorySpecification" DROP CONSTRAINT "CategorySpecification_specificationId_fkey";

-- DropTable
DROP TABLE "CategoryAttribute";

-- DropTable
DROP TABLE "CategorySpecification";

-- CreateTable
CREATE TABLE "category_attributes" (
    "categoryId" UUID NOT NULL,
    "attributeId" UUID NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "category_attributes_pkey" PRIMARY KEY ("categoryId","attributeId")
);

-- CreateTable
CREATE TABLE "category_specifications" (
    "categoryId" UUID NOT NULL,
    "specificationId" UUID NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "category_specifications_pkey" PRIMARY KEY ("categoryId","specificationId")
);

-- AddForeignKey
ALTER TABLE "category_attributes" ADD CONSTRAINT "category_attributes_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_attributes" ADD CONSTRAINT "category_attributes_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_specifications" ADD CONSTRAINT "category_specifications_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_specifications" ADD CONSTRAINT "category_specifications_specificationId_fkey" FOREIGN KEY ("specificationId") REFERENCES "specifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
