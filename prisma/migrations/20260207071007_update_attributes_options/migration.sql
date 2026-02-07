/*
  Warnings:

  - A unique constraint covering the columns `[attributeId,value]` on the table `attributes_options` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "attributes_options_attributeId_value_key" ON "attributes_options"("attributeId", "value");
