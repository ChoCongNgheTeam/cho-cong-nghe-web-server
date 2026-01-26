-- CreateEnum
CREATE TYPE "BlogStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CommentTargetType" AS ENUM ('BLOG', 'PRODUCT', 'PAGE');

-- CreateEnum
CREATE TYPE "PageType" AS ENUM ('PAGE', 'POLICY');

-- CreateEnum
CREATE TYPE "PolicyType" AS ENUM ('PRIVACY', 'TERMS', 'SHIPPING', 'RETURN', 'PAYMENT');

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_shippingAddressId_fkey";

-- AlterTable
ALTER TABLE "products_variants" ALTER COLUMN "quantity" SET DEFAULT 10;

-- CreateTable
CREATE TABLE "blogs" (
    "id" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "thumbnail" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "status" "BlogStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "targetType" "CommentTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "parentId" UUID,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" UUID NOT NULL,
    "type" "PageType" NOT NULL,
    "policyType" "PolicyType",
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_blogsTocomments" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_blogsTocomments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "blogs_slug_key" ON "blogs"("slug");

-- CreateIndex
CREATE INDEX "comments_targetType_targetId_idx" ON "comments"("targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- CreateIndex
CREATE INDEX "_blogsTocomments_B_index" ON "_blogsTocomments"("B");

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blogsTocomments" ADD CONSTRAINT "_blogsTocomments_A_fkey" FOREIGN KEY ("A") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blogsTocomments" ADD CONSTRAINT "_blogsTocomments_B_fkey" FOREIGN KEY ("B") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
