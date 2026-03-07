/*
  Warnings:

  - Added the required column `code` to the `payment_methods` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payment_methods" ADD COLUMN     "code" TEXT NOT NULL;
