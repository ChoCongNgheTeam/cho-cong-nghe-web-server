/*
  Warnings:

  - You are about to drop the column `thumbnail` on the `blogs` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "PromotionActionType" ADD VALUE 'FREE_SHIPPING';

-- AlterTable
ALTER TABLE "blogs" DROP COLUMN "thumbnail",
ADD COLUMN     "imagePath" TEXT,
ADD COLUMN     "imageUrl" TEXT;
