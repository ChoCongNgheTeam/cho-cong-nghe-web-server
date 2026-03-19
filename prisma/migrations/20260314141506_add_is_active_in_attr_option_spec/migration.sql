-- AlterTable
ALTER TABLE "attributes" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "attributes_options" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "specifications" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
