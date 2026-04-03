-- CreateEnum
CREATE TYPE "AiContentType" AS ENUM ('PRODUCT_DESCRIPTION', 'BLOG_POST');

-- CreateTable
CREATE TABLE "ai_contents" (
    "id" UUID NOT NULL,
    "type" "AiContentType" NOT NULL,
    "referenceId" UUID,
    "focusKeyword" TEXT NOT NULL,
    "inputData" JSONB NOT NULL,
    "outputContent" TEXT NOT NULL,
    "seoScore" INTEGER NOT NULL,
    "seoDetails" JSONB NOT NULL,
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_sessions" (
    "id" UUID NOT NULL,
    "sessionKey" TEXT NOT NULL,
    "messages" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_contents_type_referenceId_idx" ON "ai_contents"("type", "referenceId");

-- CreateIndex
CREATE INDEX "ai_contents_createdBy_idx" ON "ai_contents"("createdBy");

-- CreateIndex
CREATE INDEX "ai_contents_createdAt_idx" ON "ai_contents"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "chat_sessions_sessionKey_key" ON "chat_sessions"("sessionKey");

-- CreateIndex
CREATE INDEX "chat_sessions_sessionKey_idx" ON "chat_sessions"("sessionKey");

-- CreateIndex
CREATE INDEX "chat_sessions_expiresAt_idx" ON "chat_sessions"("expiresAt");
