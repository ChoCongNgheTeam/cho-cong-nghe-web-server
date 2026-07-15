-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE IF NOT EXISTS "products_vector" (
    "productId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "products_vector_pkey" PRIMARY KEY ("productId")
);

-- AddForeignKey
ALTER TABLE
    "products_vector" DROP CONSTRAINT IF EXISTS "products_vector_productId_fkey";

ALTER TABLE
    "products_vector"
ADD
    CONSTRAINT "products_vector_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE;