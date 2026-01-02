/*
  Warnings:

  - The `isApproved` column on the `reviews` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[parentId,position]` on the table `categories` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "isApproved",
ADD COLUMN     "isApproved" "ReviewStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE UNIQUE INDEX "categories_parentId_position_key" ON "categories"("parentId", "position");
