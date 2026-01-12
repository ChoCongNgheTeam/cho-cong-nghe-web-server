-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN     "deviceId" TEXT,
ADD COLUMN     "ip" TEXT,
ADD COLUMN     "userAgent" TEXT;
