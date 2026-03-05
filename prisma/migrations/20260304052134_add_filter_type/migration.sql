-- CreateEnum
CREATE TYPE "FilterType" AS ENUM ('RANGE', 'ENUM', 'BOOLEAN');

-- AlterTable
ALTER TABLE "specifications" ADD COLUMN     "filterType" "FilterType";
