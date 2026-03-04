-- DropForeignKey
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_productVariantId_fkey";

-- DropForeignKey
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_userId_fkey";

-- DropForeignKey
ALTER TABLE "category_variant_attributes" DROP CONSTRAINT "category_variant_attributes_attributeId_fkey";

-- DropForeignKey
ALTER TABLE "category_variant_attributes" DROP CONSTRAINT "category_variant_attributes_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_userId_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_orderId_fkey";

-- DropForeignKey
ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "password_reset_tokens_userId_fkey";

-- DropForeignKey
ALTER TABLE "product_color_images" DROP CONSTRAINT "product_color_images_productId_fkey";

-- DropForeignKey
ALTER TABLE "product_specifications" DROP CONSTRAINT "product_specifications_productId_fkey";

-- DropForeignKey
ALTER TABLE "products_variants" DROP CONSTRAINT "products_variants_productId_fkey";

-- DropForeignKey
ALTER TABLE "promotion_rules" DROP CONSTRAINT "promotion_rules_promotionId_fkey";

-- DropForeignKey
ALTER TABLE "promotion_targets" DROP CONSTRAINT "promotion_targets_promotionId_fkey";

-- DropForeignKey
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_userId_fkey";

-- DropForeignKey
ALTER TABLE "variants_attributes" DROP CONSTRAINT "variants_attributes_productVariantId_fkey";

-- DropForeignKey
ALTER TABLE "voucher_targets" DROP CONSTRAINT "voucher_targets_voucherId_fkey";

-- DropForeignKey
ALTER TABLE "voucher_user" DROP CONSTRAINT "voucher_user_userId_fkey";

-- DropForeignKey
ALTER TABLE "voucher_user" DROP CONSTRAINT "voucher_user_voucherId_fkey";

-- DropForeignKey
ALTER TABLE "wishlist" DROP CONSTRAINT "wishlist_productVariantId_fkey";

-- DropForeignKey
ALTER TABLE "wishlist" DROP CONSTRAINT "wishlist_userId_fkey";

-- AlterTable
ALTER TABLE "blogs" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" UUID;

-- AlterTable
ALTER TABLE "brands" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" UUID;

-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" UUID;

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" UUID;

-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" UUID;

-- AlterTable
ALTER TABLE "image_media" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" UUID;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" UUID;

-- AlterTable
ALTER TABLE "pages" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" UUID;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" UUID;

-- AlterTable
ALTER TABLE "products_variants" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" UUID;

-- AlterTable
ALTER TABLE "promotions" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" UUID;

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" UUID;

-- AlterTable
ALTER TABLE "user_addresses" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" UUID;

-- AlterTable
ALTER TABLE "vouchers" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" UUID;

-- CreateIndex
CREATE INDEX "blogs_deletedAt_idx" ON "blogs"("deletedAt");

-- CreateIndex
CREATE INDEX "brands_deletedAt_idx" ON "brands"("deletedAt");

-- CreateIndex
CREATE INDEX "campaigns_deletedAt_idx" ON "campaigns"("deletedAt");

-- CreateIndex
CREATE INDEX "categories_deletedAt_idx" ON "categories"("deletedAt");

-- CreateIndex
CREATE INDEX "comments_deletedAt_idx" ON "comments"("deletedAt");

-- CreateIndex
CREATE INDEX "image_media_deletedAt_idx" ON "image_media"("deletedAt");

-- CreateIndex
CREATE INDEX "orders_deletedAt_idx" ON "orders"("deletedAt");

-- CreateIndex
CREATE INDEX "orders_userId_idx" ON "orders"("userId");

-- CreateIndex
CREATE INDEX "pages_deletedAt_idx" ON "pages"("deletedAt");

-- CreateIndex
CREATE INDEX "products_deletedAt_idx" ON "products"("deletedAt");

-- CreateIndex
CREATE INDEX "products_variants_deletedAt_idx" ON "products_variants"("deletedAt");

-- CreateIndex
CREATE INDEX "promotions_deletedAt_idx" ON "promotions"("deletedAt");

-- CreateIndex
CREATE INDEX "reviews_deletedAt_idx" ON "reviews"("deletedAt");

-- CreateIndex
CREATE INDEX "user_addresses_deletedAt_idx" ON "user_addresses"("deletedAt");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE INDEX "vouchers_deletedAt_idx" ON "vouchers"("deletedAt");

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_variant_attributes" ADD CONSTRAINT "category_variant_attributes_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_variant_attributes" ADD CONSTRAINT "category_variant_attributes_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products_variants" ADD CONSTRAINT "products_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_color_images" ADD CONSTRAINT "product_color_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variants_attributes" ADD CONSTRAINT "variants_attributes_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "products_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_specifications" ADD CONSTRAINT "product_specifications_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "products_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "products_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_targets" ADD CONSTRAINT "voucher_targets_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "vouchers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_user" ADD CONSTRAINT "voucher_user_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "vouchers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voucher_user" ADD CONSTRAINT "voucher_user_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_rules" ADD CONSTRAINT "promotion_rules_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_targets" ADD CONSTRAINT "promotion_targets_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
