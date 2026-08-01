-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('PENDING', 'CREATED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'RETURNED', 'CANCELLED');

-- CreateTable
CREATE TABLE "shipping_providers" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipments" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "providerId" UUID NOT NULL,
    "providerOrderCode" TEXT,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'PENDING',
    "shippingFee" DECIMAL(12,2),
    "expectedDeliveryAt" TIMESTAMP(3),
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "failedReason" TEXT,
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_view_events" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "sessionId" TEXT,
    "productId" UUID NOT NULL,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_view_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendation_events" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "sessionId" TEXT,
    "productId" UUID NOT NULL,
    "algorithm" TEXT NOT NULL,
    "wasClicked" BOOLEAN NOT NULL DEFAULT false,
    "shownAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clickedAt" TIMESTAMP(3),

    CONSTRAINT "recommendation_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shipping_providers_code_key" ON "shipping_providers"("code");

-- CreateIndex
CREATE INDEX "shipments_orderId_idx" ON "shipments"("orderId");

-- CreateIndex
CREATE INDEX "shipments_status_idx" ON "shipments"("status");

-- CreateIndex
CREATE INDEX "shipments_providerOrderCode_idx" ON "shipments"("providerOrderCode");

-- CreateIndex
CREATE INDEX "product_view_events_userId_createdAt_idx" ON "product_view_events"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "product_view_events_productId_idx" ON "product_view_events"("productId");

-- CreateIndex
CREATE INDEX "product_view_events_sessionId_createdAt_idx" ON "product_view_events"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "recommendation_events_productId_idx" ON "recommendation_events"("productId");

-- CreateIndex
CREATE INDEX "recommendation_events_algorithm_idx" ON "recommendation_events"("algorithm");

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "shipping_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
