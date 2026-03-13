-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "bankTransferContent" TEXT,
ADD COLUMN     "bankTransferExpiredAt" TIMESTAMP(3),
ADD COLUMN     "bankTransferQrUrl" TEXT,
ADD COLUMN     "paymentExpiredAt" TIMESTAMP(3),
ADD COLUMN     "paymentRedirectUrl" TEXT;
