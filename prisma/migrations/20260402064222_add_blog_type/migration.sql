-- CreateEnum
CREATE TYPE "BlogType" AS ENUM ('TIN_MOI', 'DANH_GIA', 'KHUYEN_MAI', 'DIEN_MAY', 'NOI_BAT');

-- AlterTable
ALTER TABLE "blogs" ADD COLUMN     "type" "BlogType" NOT NULL DEFAULT 'TIN_MOI';
