/*
  Warnings:

  - Added the required column `ttlType` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RefreshTokenTTLType" AS ENUM ('short', 'long');

-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN     "ttlType" "RefreshTokenTTLType" NOT NULL;
