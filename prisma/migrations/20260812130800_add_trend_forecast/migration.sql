-- CreateTable
CREATE TABLE "search_query_logs" (
    "id" UUID NOT NULL,
    "query" TEXT NOT NULL,
    "userId" UUID,
    "resultCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_query_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demand_forecasts" (
    "id" UUID NOT NULL,
    "keyword" TEXT,
    "productId" UUID,
    "period" TEXT NOT NULL,
    "forecastScore" DOUBLE PRECISION NOT NULL,
    "suggestedAction" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "demand_forecasts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "search_query_logs_createdAt_idx" ON "search_query_logs"("createdAt");

-- CreateIndex
CREATE INDEX "search_query_logs_query_idx" ON "search_query_logs"("query");

-- CreateIndex
CREATE INDEX "demand_forecasts_generatedAt_idx" ON "demand_forecasts"("generatedAt");
