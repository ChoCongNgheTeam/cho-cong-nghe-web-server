-- Step 1: Thêm columns mới dạng NULLABLE trước
ALTER TABLE "user_addresses"
  ADD COLUMN "provinceCode" INTEGER,
  ADD COLUMN "provinceName" TEXT,
  ADD COLUMN "wardCode"     INTEGER,
  ADD COLUMN "wardName"     TEXT;

-- Step 2: Fill data từ bảng provinces/wards cũ sang columns mới
UPDATE "user_addresses" ua
SET
  "provinceCode" = CAST(p.code AS INTEGER),
  "provinceName" = p."fullName",
  "wardCode"     = CAST(w.code AS INTEGER),
  "wardName"     = w."fullName"
FROM "provinces" p, "wards" w
WHERE ua."provinceId" = p.id
  AND ua."wardId"     = w.id;

-- Step 3: Đặt NOT NULL sau khi đã có data
ALTER TABLE "user_addresses"
  ALTER COLUMN "provinceCode" SET NOT NULL,
  ALTER COLUMN "provinceName" SET NOT NULL,
  ALTER COLUMN "wardCode"     SET NOT NULL,
  ALTER COLUMN "wardName"     SET NOT NULL;

-- Step 4: Xóa FK constraints và columns cũ
ALTER TABLE "user_addresses"
  DROP CONSTRAINT IF EXISTS "user_addresses_provinceId_fkey",
  DROP CONSTRAINT IF EXISTS "user_addresses_wardId_fkey",
  DROP COLUMN "provinceId",
  DROP COLUMN "wardId";

-- Step 5: Xóa index cũ
DROP INDEX IF EXISTS "user_addresses_provinceId_idx";
DROP INDEX IF EXISTS "user_addresses_wardId_idx";

-- Step 6: Drop 2 bảng cũ
DROP TABLE IF EXISTS "wards";
DROP TABLE IF EXISTS "provinces";