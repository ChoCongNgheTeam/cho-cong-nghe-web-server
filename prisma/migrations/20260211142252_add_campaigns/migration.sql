-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('RANKING', 'CAMPAIGN', 'SEASONAL', 'EVENT');

-- CreateTable
CREATE TABLE "campaigns" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "CampaignType" NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_categories" (
    "id" UUID NOT NULL,
    "campaignId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "title" TEXT,
    "description" TEXT,

    CONSTRAINT "campaign_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "campaigns_slug_key" ON "campaigns"("slug");

-- CreateIndex
CREATE INDEX "campaign_categories_campaignId_idx" ON "campaign_categories"("campaignId");

-- CreateIndex
CREATE INDEX "campaign_categories_categoryId_idx" ON "campaign_categories"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_categories_campaignId_categoryId_key" ON "campaign_categories"("campaignId", "categoryId");

-- AddForeignKey
ALTER TABLE "campaign_categories" ADD CONSTRAINT "campaign_categories_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_categories" ADD CONSTRAINT "campaign_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
