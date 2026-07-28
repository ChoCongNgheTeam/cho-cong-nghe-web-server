-- AlterEnum
ALTER TYPE "MediaPosition" ADD VALUE 'HOME_POPUP';

-- CreateTable
CREATE TABLE "spin_prizes" (
    "id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "colorHex" TEXT,
    "voucherId" UUID,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "totalBudget" INTEGER,
    "awardedCount" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spin_prizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spin_entries" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "prizeId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spin_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "spin_prizes_isActive_idx" ON "spin_prizes"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "spin_entries_userId_key" ON "spin_entries"("userId");

-- CreateIndex
CREATE INDEX "spin_entries_prizeId_idx" ON "spin_entries"("prizeId");

-- AddForeignKey
ALTER TABLE "spin_prizes" ADD CONSTRAINT "spin_prizes_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "vouchers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spin_entries" ADD CONSTRAINT "spin_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spin_entries" ADD CONSTRAINT "spin_entries_prizeId_fkey" FOREIGN KEY ("prizeId") REFERENCES "spin_prizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
