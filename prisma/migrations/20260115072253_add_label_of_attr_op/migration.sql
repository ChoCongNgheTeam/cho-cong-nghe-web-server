/*
  Warnings:

  - Added the required column `label` to the `attributes_options` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "attributes_options" ADD COLUMN     "label" TEXT NOT NULL;
