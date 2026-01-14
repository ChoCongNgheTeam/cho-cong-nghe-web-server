/*
  Warnings:

  - Added the required column `groupName` to the `category_specifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "category_specifications" ADD COLUMN     "groupName" TEXT NOT NULL;
