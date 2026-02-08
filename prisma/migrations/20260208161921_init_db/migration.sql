/*
  Warnings:

  - You are about to drop the column `districtId` on the `user_addresses` table. All the data in the column will be lost.
  - Changed the type of `provinceId` on the `user_addresses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `wardId` to the `user_addresses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "AddressType" ADD VALUE 'OTHER';

-- AlterTable
ALTER TABLE "user_addresses" DROP COLUMN "districtId",
DROP COLUMN "provinceId",
ADD COLUMN     "provinceId" UUID NOT NULL,
DROP COLUMN "wardId",
ADD COLUMN     "wardId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "provinces" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provinces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wards" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provinceId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "provinces_code_key" ON "provinces"("code");

-- CreateIndex
CREATE UNIQUE INDEX "wards_code_key" ON "wards"("code");

-- CreateIndex
CREATE INDEX "wards_provinceId_idx" ON "wards"("provinceId");

-- CreateIndex
CREATE INDEX "user_addresses_userId_idx" ON "user_addresses"("userId");

-- CreateIndex
CREATE INDEX "user_addresses_provinceId_idx" ON "user_addresses"("provinceId");

-- CreateIndex
CREATE INDEX "user_addresses_wardId_idx" ON "user_addresses"("wardId");

-- AddForeignKey
ALTER TABLE "wards" ADD CONSTRAINT "wards_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "provinces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_wardId_fkey" FOREIGN KEY ("wardId") REFERENCES "wards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
