/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `payment_methods` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_code_key" ON "payment_methods"("code");
