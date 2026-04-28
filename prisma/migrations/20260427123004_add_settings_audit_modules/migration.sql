-- CreateEnum
CREATE TYPE "SettingDataType" AS ENUM ('STRING', 'BOOLEAN', 'NUMBER', 'JSON');

-- CreateEnum
CREATE TYPE "AuditSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'BULK_ACTION', 'LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'SETTINGS_CHANGE', 'PERMISSION_CHANGE', 'EXPORT');

-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN     "browser" TEXT,
ADD COLUMN     "deviceName" TEXT,
ADD COLUMN     "lastUsedAt" TIMESTAMP(3),
ADD COLUMN     "location" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "notifEmail" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifOrderStatus" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifPush" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifReviewNew" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifUserInactive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifWeeklyReport" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "system_settings" (
    "id" UUID NOT NULL,
    "group" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "dataType" "SettingDataType" NOT NULL DEFAULT 'STRING',
    "updatedBy" UUID,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "userName" TEXT,
    "userRole" TEXT,
    "action" "AuditAction" NOT NULL,
    "module" TEXT NOT NULL,
    "targetId" TEXT,
    "targetType" TEXT,
    "description" TEXT NOT NULL,
    "diff" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "location" TEXT,
    "severity" "AuditSeverity" NOT NULL DEFAULT 'INFO',
    "isSuccess" BOOLEAN NOT NULL DEFAULT true,
    "errorMsg" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_history" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "email" TEXT,
    "isSuccess" BOOLEAN NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "location" TEXT,
    "failReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "system_settings_group_idx" ON "system_settings"("group");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_group_key_key" ON "system_settings"("group", "key");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_module_idx" ON "audit_logs"("module");

-- CreateIndex
CREATE INDEX "audit_logs_severity_idx" ON "audit_logs"("severity");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_ip_createdAt_idx" ON "audit_logs"("ip", "createdAt");

-- CreateIndex
CREATE INDEX "login_history_userId_idx" ON "login_history"("userId");

-- CreateIndex
CREATE INDEX "login_history_ip_createdAt_idx" ON "login_history"("ip", "createdAt");

-- CreateIndex
CREATE INDEX "login_history_createdAt_idx" ON "login_history"("createdAt");
