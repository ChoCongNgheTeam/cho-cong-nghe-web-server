-- DropForeignKey
ALTER TABLE "public"."products_vector" DROP CONSTRAINT "products_vector_productId_fkey";

-- AlterTable
ALTER TABLE "public"."products_vector" ALTER COLUMN "embedding" SET DATA TYPE vector(384);

-- AddForeignKey
ALTER TABLE "public"."products_vector" ADD CONSTRAINT "products_vector_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

