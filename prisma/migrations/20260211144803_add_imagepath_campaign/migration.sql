/*
  Warnings:

  - Added the required column `imagePath` to the `campaign_categories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "campaign_categories" ADD COLUMN     "imagePath" TEXT NOT NULL;
