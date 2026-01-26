-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('SLIDER', 'BANNER');

-- CreateEnum
CREATE TYPE "MediaPosition" AS ENUM ('HOME_TOP', 'BELOW_SLIDER', 'HOME_SECTION_1', 'HOME_SECTION_2');

-- CreateTable
CREATE TABLE "image_media" (
    "id" UUID NOT NULL,
    "type" "MediaType" NOT NULL,
    "position" "MediaPosition" NOT NULL,
    "title" TEXT,
    "imagePath" TEXT NOT NULL,
    "imageUrl" TEXT,
    "linkUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "image_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "image_media_type_position_idx" ON "image_media"("type", "position");

-- CreateIndex
CREATE INDEX "image_media_isActive_idx" ON "image_media"("isActive");
