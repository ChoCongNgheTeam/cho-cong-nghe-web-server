/**
 * VARIANT SEED DATA
 * =================
 * File này chứa dữ liệu seed cho variantData và variantImages.
 *
 * MAPPING VỚI SCHEMA:
 *   - Mỗi key (slug) trong variantData   → 1 bản ghi products
 *   - Mỗi phần tử trong array            → 1 bản ghi products_variants
 *   - Mỗi attribute (ram/storage/color…) → 1 bản ghi variants_attributes
 *   - isDefault     → products_variants.isDefault (variant mặc định khi vào product detail)
 *   - variantDisplay (SELECTOR | CARD)   → set trực tiếp ở bảng products khi seed
 *
 * ĐÃ BỎ KHỎI FILE NÀY:
 *   - displayCard   → thay bằng variantDisplay (SELECTOR | CARD) ở model products
 *
 * THỨ TỰ SLUG (đồng nhất giữa variantData và variantImages):
 *   1. iPhone
 *   2. Samsung   → Z Series → S Series → A Series → M Series → XCover Series
 *   3. OPPO      → Reno Series → A Series → Find Series
 *   4. Xiaomi    → POCO Series → Redmi Series → Redmi Note Series → Flagship
 *   5. MacBook   → Air (cũ→mới) → Pro (cũ→mới)
 *   6. Máy lạnh  → Comfee → Casper
 *   7. Tai nghe  → EarPods Lightning → EarPods USB-C → AirPods
 */

// ----------------------------------------------------------------
// Kiểu dữ liệu cho 1 variant (1 bản ghi products_variants + attributes)
// ----------------------------------------------------------------
export type VariantEntry = {
  ram?: string; // → variants_attributes { key: "ram",              value: "8gb"   }
  storage?: string; // → variants_attributes { key: "storage",          value: "128gb" }
  color?: string; // → variants_attributes { key: "color",            value: "black" }
  gpu?: string; // → variants_attributes { key: "gpu",              value: "10core"}
  size?: string; // → variants_attributes { key: "size",              value: "43inch" }
  capacity_cooling?: string; // → variants_attributes { key: "capacity_cooling", value: "1-5hp" }
  price: number; // → products_variants.price
  isDefault?: boolean; // → products_variants.isDefault
};

export const variantData: Record<string, VariantEntry[]> = {
  // ================================================================
  // 1. IPHONE
  // ================================================================

  "iphone-13": [
    { storage: "128gb", color: "white", price: 13490000, isDefault: true },
    { storage: "128gb", color: "black", price: 13490000 },
    { storage: "128gb", color: "blue", price: 13490000 },
    { storage: "128gb", color: "red", price: 13490000 },
    { storage: "128gb", color: "pink", price: 13490000 },
    { storage: "256gb", color: "black", price: 15990000 },
    { storage: "256gb", color: "white", price: 15990000 },
    { storage: "256gb", color: "red", price: 15990000 },
    { storage: "256gb", color: "pink", price: 15990000 },
    { storage: "256gb", color: "alpine-green", price: 16490000 },
    { storage: "512gb", color: "black", price: 18990000 },
  ],

  "iphone-14": [
    { storage: "128gb", color: "black", price: 16990000, isDefault: true },
    { storage: "128gb", color: "white", price: 16990000 },
    { storage: "256gb", color: "black", price: 19990000 },
    { storage: "256gb", color: "white", price: 19990000 },
    { storage: "512gb", color: "black", price: 22990000 },
    { storage: "512gb", color: "white", price: 22990000 },
  ],

  "iphone-15": [
    { storage: "128gb", color: "black", price: 21990000, isDefault: true },
    { storage: "256gb", color: "black", price: 24990000 },
    { storage: "512gb", color: "black", price: 27990000 },
  ],

  "iphone-16": [
    { storage: "128gb", color: "black", price: 26990000, isDefault: true },
    { storage: "256gb", color: "black", price: 29990000 },
    { storage: "512gb", color: "black", price: 32990000 },
  ],

  "iphone-16-plus": [
    { storage: "128gb", color: "black", price: 31990000, isDefault: true },
    { storage: "256gb", color: "black", price: 34990000 },
    { storage: "512gb", color: "black", price: 37990000 },
  ],

  "iphone-16-pro-max": [
    { storage: "128gb", color: "titan-black", price: 39990000, isDefault: true },
    { storage: "256gb", color: "titan-black", price: 42990000 },
    { storage: "512gb", color: "titan-black", price: 45990000 },
  ],

  "iphone-17": [
    { storage: "128gb", color: "black", price: 46990000, isDefault: true },
    { storage: "256gb", color: "black", price: 49990000 },
    { storage: "512gb", color: "black", price: 52990000 },
  ],

  "iphone-17-pro": [
    { storage: "128gb", color: "silver", price: 50990000, isDefault: true },
    { storage: "256gb", color: "silver", price: 53990000 },
    { storage: "512gb", color: "silver", price: 56990000 },
  ],

  "iphone-17-pro-max": [
    { storage: "128gb", color: "orange", price: 53990000, isDefault: true },
    { storage: "256gb", color: "orange", price: 56990000 },
    { storage: "512gb", color: "orange", price: 59990000 },
  ],

  // ================================================================
  // 2. SAMSUNG
  // ================================================================

  // ----------------------------------------------------------------
  // --- Galaxy Z Series ---
  // ----------------------------------------------------------------

  "samsung-galaxy-z-fold6-5g": [
    { storage: "256gb", color: "black", price: 34990000, isDefault: true },
    { storage: "512gb", color: "black", price: 38490000 },
  ],

  "samsung-galaxy-z-fold7-5g": [
    { ram: "12gb", storage: "256gb", color: "black", price: 40990000, isDefault: true },
    { ram: "12gb", storage: "512gb", color: "black", price: 44990000 },
  ],

  "samsung-galaxy-z-flip7-5g": [{ ram: "12gb", storage: "256gb", color: "black", price: 25990000, isDefault: true }],

  // ----------------------------------------------------------------
  // --- Galaxy S Series ---
  // ----------------------------------------------------------------

  "samsung-galaxy-s24-fe-5g": [
    { storage: "128gb", color: "black", price: 12990000, isDefault: true },
    { storage: "256gb", color: "black", price: 13990000 },
  ],

  "samsung-galaxy-s24-ultra-5g": [
    { storage: "256gb", color: "black", price: 23990000, isDefault: true },
    { storage: "512gb", color: "black", price: 26990000 },
  ],

  "samsung-galaxy-s25-fe-5g": [
    { ram: "8gb", storage: "128gb", color: "black", price: 14990000, isDefault: true },
    { ram: "8gb", storage: "256gb", color: "black", price: 16490000 },
  ],

  "samsung-galaxy-s25-edge-5g": [
    { storage: "256gb", color: "black", price: 19990000, isDefault: true },
    { storage: "512gb", color: "black", price: 22990000 },
  ],

  "samsung-galaxy-s25-5g": [
    { ram: "12gb", storage: "256gb", color: "black", price: 21990000, isDefault: true },
    { ram: "12gb", storage: "512gb", color: "black", price: 24990000 },
  ],

  "samsung-galaxy-s25-plus-5g": [
    { ram: "12gb", storage: "256gb", color: "black", price: 25990000, isDefault: true },
    { ram: "12gb", storage: "512gb", color: "black", price: 28990000 },
  ],

  "samsung-galaxy-s25-ultra-5g": [
    { ram: "12gb", storage: "256gb", color: "black", price: 31990000, isDefault: true },
    { ram: "12gb", storage: "512gb", color: "black", price: 34990000 },
    { ram: "12gb", storage: "1tb", color: "black", price: 38990000 },
  ],

  // ----------------------------------------------------------------
  // --- Galaxy A Series ---
  // ----------------------------------------------------------------

  "samsung-galaxy-a06": [
    { ram: "4gb", storage: "64gb", color: "black", price: 3490000, isDefault: true },
    { ram: "4gb", storage: "128gb", color: "black", price: 3990000 },
  ],

  "samsung-galaxy-a06-5g": [{ ram: "4gb", storage: "128gb", color: "black", price: 4490000, isDefault: true }],

  "samsung-galaxy-a07": [
    { ram: "4gb", storage: "64gb", color: "black", price: 3290000, isDefault: true },
    { ram: "4gb", storage: "128gb", color: "black", price: 3690000 },
  ],

  "samsung-galaxy-a07-5g": [{ ram: "4gb", storage: "64gb", color: "black", price: 3990000, isDefault: true }],

  "samsung-galaxy-a16": [{ ram: "4gb", storage: "128gb", color: "black", price: 4990000, isDefault: true }],

  "samsung-galaxy-a16-5g": [
    { ram: "8gb", storage: "128gb", color: "black", price: 5990000, isDefault: true },
    { ram: "8gb", storage: "256gb", color: "black", price: 6990000 },
  ],

  "samsung-galaxy-a17": [
    { ram: "8gb", storage: "128gb", color: "black", price: 5490000, isDefault: true },
    { ram: "8gb", storage: "256gb", color: "black", price: 6490000 },
  ],

  "samsung-galaxy-a17-5g": [
    { ram: "8gb", storage: "128gb", color: "black", price: 6490000, isDefault: true },
    { ram: "8gb", storage: "256gb", color: "black", price: 7490000 },
  ],

  "samsung-galaxy-a26-5g": [
    { ram: "8gb", storage: "128gb", color: "black", price: 7490000, isDefault: true },
    { ram: "8gb", storage: "256gb", color: "black", price: 8490000 },
  ],

  "samsung-galaxy-a36-5g": [{ ram: "8gb", storage: "128gb", color: "black", price: 8990000, isDefault: true }],

  "samsung-galaxy-a56-5g": [{ ram: "8gb", storage: "128gb", color: "black", price: 10990000, isDefault: true }],

  // ----------------------------------------------------------------
  // --- Galaxy M Series ---
  // ----------------------------------------------------------------

  "samsung-galaxy-m55-5g": [{ ram: "8gb", storage: "256gb", color: "black", price: 8990000, isDefault: true }],

  // ----------------------------------------------------------------
  // --- Galaxy XCover Series ---
  // ----------------------------------------------------------------

  "samsung-galaxy-xcover7-pro-5g": [{ ram: "6gb", storage: "128gb", color: "black", price: 12990000, isDefault: true }],

  // ================================================================
  // 3. OPPO
  // ================================================================

  // ----------------------------------------------------------------
  // --- Reno Series ---
  // ----------------------------------------------------------------

  "oppo-reno11-f-5g": [
    { ram: "8gb", storage: "128gb", color: "black", price: 10990000, isDefault: true },
    { ram: "8gb", storage: "256gb", color: "black", price: 12990000 },
  ],

  "oppo-reno12-f-5g": [
    { ram: "8gb", storage: "128gb", color: "black", price: 10990000, isDefault: true },
    { ram: "8gb", storage: "256gb", color: "black", price: 12990000 },
  ],

  "oppo-reno13-f-5g": [
    { ram: "12gb", storage: "256gb", color: "black", price: 13990000, isDefault: true },
    { ram: "12gb", storage: "512gb", color: "black", price: 15490000 },
  ],

  "oppo-reno14-f-5g": [
    { ram: "8gb", storage: "128gb", color: "black", price: 10990000, isDefault: true },
    { ram: "8gb", storage: "256gb", color: "black", price: 12990000 },
  ],

  "oppo-reno14-5g": [
    { ram: "12gb", storage: "256gb", color: "black", price: 13990000, isDefault: true },
    { ram: "12gb", storage: "512gb", color: "black", price: 15490000 },
  ],

  "oppo-reno15-f-5g": [
    { ram: "8gb", storage: "128gb", color: "black", price: 10990000, isDefault: true },
    { ram: "8gb", storage: "256gb", color: "black", price: 12990000 },
  ],

  "oppo-reno15-5g": [
    { ram: "12gb", storage: "256gb", color: "black", price: 13990000, isDefault: true },
    { ram: "12gb", storage: "512gb", color: "black", price: 15490000 },
  ],

  // ----------------------------------------------------------------
  // --- A Series ---
  // ----------------------------------------------------------------

  "oppo-a3": [
    { ram: "6gb", storage: "128gb", color: "black", price: 10990000, isDefault: true },
    { ram: "8gb", storage: "256gb", color: "black", price: 12990000 },
  ],

  "oppo-a5i": [
    { ram: "4gb", storage: "128gb", color: "black", price: 10990000, isDefault: true },
    { ram: "6gb", storage: "128gb", color: "black", price: 10990000 },
  ],

  "oppo-a5i-pro": [
    { ram: "8gb", storage: "128gb", color: "black", price: 10990000, isDefault: true },
    { ram: "8gb", storage: "256gb", color: "black", price: 12990000 },
  ],

  "oppo-a6t": [
    { ram: "4gb", storage: "128gb", color: "black", price: 10990000, isDefault: true },
    { ram: "6gb", storage: "256gb", color: "black", price: 12990000 },
  ],

  "oppo-a6-pro": [
    { ram: "8gb", storage: "128gb", color: "black", price: 10990000, isDefault: true },
    { ram: "8gb", storage: "256gb", color: "black", price: 12990000 },
  ],

  "oppo-a18": [
    { ram: "4gb", storage: "128gb", color: "black", price: 10990000, isDefault: true },
    { ram: "4gb", storage: "256gb", color: "black", price: 12990000 },
  ],

  "oppo-a58": [
    { ram: "6gb", storage: "128gb", color: "black", price: 10990000, isDefault: true },
    { ram: "8gb", storage: "128gb", color: "black", price: 10990000 },
    { ram: "8gb", storage: "256gb", color: "black", price: 12990000 },
  ],

  // ----------------------------------------------------------------
  // --- Find Series ---
  // ----------------------------------------------------------------

  "oppo-find-x9-5g": [
    { ram: "12gb", storage: "256gb", color: "black", price: 13990000, isDefault: true },
    { ram: "16gb", storage: "256gb", color: "black", price: 13990000 },
    { ram: "16gb", storage: "512gb", color: "black", price: 15490000 },
  ],

  "oppo-find-x9-pro-5g": [
    { ram: "16gb", storage: "256gb", color: "black", price: 13990000, isDefault: true },
    { ram: "16gb", storage: "512gb", color: "black", price: 15490000 },
  ],

  "oppo-find-n3-5g": [
    { ram: "16gb", storage: "256gb", color: "black", price: 13990000, isDefault: true },
    { ram: "16gb", storage: "512gb", color: "black", price: 15490000 },
  ],

  "oppo-find-n5-5g": [
    { ram: "16gb", storage: "256gb", color: "black", price: 13990000, isDefault: true },
    { ram: "16gb", storage: "512gb", color: "black", price: 15490000 },
  ],

  // ================================================================
  // 4. XIAOMI
  // ================================================================

  // ----------------------------------------------------------------
  // --- POCO Series ---
  // ----------------------------------------------------------------

  "xiaomi-poco-c71": [{ ram: "4gb", storage: "128gb", color: "black", price: 2990000, isDefault: true }],

  "xiaomi-poco-m6-pro": [
    { ram: "8gb", storage: "128gb", color: "black", price: 4490000, isDefault: true },
    { ram: "8gb", storage: "256gb", color: "black", price: 4990000 },
  ],

  "xiaomi-poco-m7-pro-5g": [
    { ram: "8gb", storage: "128gb", color: "black", price: 5490000, isDefault: true },
    { ram: "8gb", storage: "256gb", color: "black", price: 6290000 },
  ],

  "xiaomi-poco-x7-5g": [
    { ram: "12gb", storage: "256gb", color: "black", price: 7990000, isDefault: true },
    { ram: "12gb", storage: "512gb", color: "black", price: 8990000 },
  ],

  "xiaomi-poco-f8-pro-5g": [
    { ram: "12gb", storage: "256gb", color: "black", price: 13990000, isDefault: true },
    { ram: "12gb", storage: "512gb", color: "black", price: 15490000 },
  ],

  // ----------------------------------------------------------------
  // --- Redmi Series ---
  // ----------------------------------------------------------------

  "xiaomi-redmi-13x": [{ ram: "8gb", storage: "128gb", color: "black", price: 3490000, isDefault: true }],

  "xiaomi-redmi-14c": [{ ram: "4gb", storage: "128gb", color: "black", price: 2890000, isDefault: true }],

  "xiaomi-redmi-15-5g": [
    { ram: "8gb", storage: "128gb", color: "black", price: 5990000, isDefault: true },
    { ram: "8gb", storage: "256gb", color: "black", price: 6790000 },
  ],

  // ----------------------------------------------------------------
  // --- Redmi Note Series ---
  // ----------------------------------------------------------------

  "xiaomi-redmi-note-14": [{ ram: "6gb", storage: "128gb", color: "black", price: 3990000, isDefault: true }],

  "xiaomi-redmi-note-14-5g": [{ ram: "8gb", storage: "128gb", color: "black", price: 4990000, isDefault: true }],

  "xiaomi-redmi-note-14-pro-plus-5g": [{ ram: "8gb", storage: "256gb", color: "black", price: 7990000, isDefault: true }],

  "xiaomi-redmi-note-15": [{ ram: "6gb", storage: "128gb", color: "black", price: 5490000, isDefault: true }],

  "xiaomi-redmi-note-15-5g": [{ ram: "6gb", storage: "128gb", color: "black", price: 6490000, isDefault: true }],

  "xiaomi-redmi-note-15-pro": [
    { ram: "12gb", storage: "256gb", color: "black", price: 7990000, isDefault: true },
    { ram: "12gb", storage: "512gb", color: "black", price: 8990000 },
  ],

  "xiaomi-redmi-note-15-pro-5g": [
    { ram: "12gb", storage: "256gb", color: "black", price: 9990000, isDefault: true },
    { ram: "12gb", storage: "512gb", color: "black", price: 11490000 },
  ],

  // ----------------------------------------------------------------
  // --- Xiaomi Flagship Series ---
  // ----------------------------------------------------------------

  "xiaomi-15-5g": [{ ram: "12gb", storage: "256gb", color: "black", price: 9990000, isDefault: true }],

  "xiaomi-15-ultra-5g": [{ ram: "16gb", storage: "512gb", color: "black", price: 14990000, isDefault: true }],

  "xiaomi-15t-5g": [{ ram: "12gb", storage: "256gb", color: "black", price: 9990000, isDefault: true }],

  "xiaomi-15t-pro-5g": [{ ram: "12gb", storage: "256gb", color: "black", price: 12990000, isDefault: true }],

  // ================================================================
  // 5. MACBOOK AIR
  // ================================================================

  // --- MacBook Air 13 inch ---
  "macbook-air-13-m2": [{ gpu: "8core", ram: "16gb", storage: "256gb", color: "black", price: 24990000, isDefault: true }],

  "macbook-air-13-m3": [
    { gpu: "8core", ram: "16gb", storage: "256gb", color: "black", price: 27990000, isDefault: true },
    { gpu: "10core", ram: "16gb", storage: "512gb", color: "black", price: 32990000 },
  ],

  "macbook-air-13-m5": [
    { gpu: "10core", ram: "16gb", storage: "256gb", color: "black", price: 32990000, isDefault: true },
    { gpu: "10core", ram: "24gb", storage: "512gb", color: "black", price: 37990000 },
  ],

  // --- MacBook Air 15 inch ---
  "macbook-air-15-m3": [
    { gpu: "10core", ram: "16gb", storage: "256gb", color: "black", price: 32990000, isDefault: true },
    { gpu: "10core", ram: "24gb", storage: "512gb", color: "black", price: 42990000 },
  ],

  "macbook-air-15-m5": [
    { gpu: "10core", ram: "16gb", storage: "256gb", color: "black", price: 37990000, isDefault: true },
    { gpu: "10core", ram: "24gb", storage: "512gb", color: "black", price: 42990000 },
  ],

  // ================================================================
  // 6. MACBOOK PRO
  // ================================================================

  // --- MacBook Pro 14 inch ---
  "macbook-pro-14-m4": [{ gpu: "10core", ram: "16gb", storage: "512gb", color: "black", price: 39990000, isDefault: true }],

  "macbook-pro-14-m4-pro": [
    { gpu: "16core", ram: "24gb", storage: "512gb", color: "black", price: 49990000, isDefault: true },
    { gpu: "20core", ram: "24gb", storage: "1tb", color: "black", price: 59990000 },
  ],

  "macbook-pro-14-m5-pro": [
    { gpu: "20core", ram: "24gb", storage: "512gb", color: "black", price: 54990000, isDefault: true },
    { gpu: "20core", ram: "48gb", storage: "1tb", color: "black", price: 69990000 },
  ],

  "macbook-pro-14-m5-max": [{ gpu: "32core", ram: "36gb", storage: "1tb", color: "black", price: 89990000, isDefault: true }],

  // --- MacBook Pro 16 inch ---
  "macbook-pro-16-m4-pro": [{ gpu: "20core", ram: "24gb", storage: "512gb", color: "black", price: 64990000, isDefault: true }],

  "macbook-pro-16-m4-max": [
    { gpu: "32core", ram: "36gb", storage: "1tb", color: "black", price: 89990000, isDefault: true },
    { gpu: "40core", ram: "48gb", storage: "1tb", color: "black", price: 99900000 },
  ],

  "macbook-pro-16-m5-pro": [{ gpu: "20core", ram: "24gb", storage: "512gb", color: "black", price: 69990000, isDefault: true }],

  "macbook-pro-16-m5-max": [
    { gpu: "40core", ram: "48gb", storage: "1tb", color: "black", price: 105000000, isDefault: true },
    { gpu: "80core", ram: "128gb", storage: "2tb", color: "black", price: 155000000 },
  ],

  // ===============================================================
  // 7. LENOVO
  // ===============================================================
  // ================================================================
  // LENOVO SERIES
  // ================================================================

  // --- 1. LENOVO GAMING LOQ ---
  "lenovo-loq-15iax9e": [
    { ram: "16gb", storage: "512gb", color: "gray", price: 18990000, isDefault: true },
    { ram: "16gb", storage: "1tb", color: "gray", price: 20490000 },
  ],
  "lenovo-loq-15irp9": [
    { ram: "16gb", storage: "512gb", color: "gray", price: 23490000, isDefault: true },
    { ram: "24gb", storage: "512gb", color: "gray", price: 25990000 },
  ],

  // --- 2. LENOVO IDEAPAD ---
  "lenovo-ideapad-1-15amn7": [
    { ram: "8gb", storage: "256gb", color: "gray", price: 8490000, isDefault: true },
    { ram: "16gb", storage: "512gb", color: "gray", price: 11990000 },
  ],
  "lenovo-ideapad-slim-3-15iau7": [{ ram: "16gb", storage: "512gb", color: "gray", price: 13490000, isDefault: true }],
  "lenovo-ideapad-slim-5-14iml9": [
    { ram: "16gb", storage: "512gb", color: "gray", price: 18490000, isDefault: true },
    { ram: "32gb", storage: "1tb", color: "gray", price: 22990000 },
  ],

  // --- 3. LENOVO LEGION GAMING ---
  "lenovo-legion-5-16irx9": [
    { ram: "16gb", storage: "512gb", color: "gray", price: 34990000, isDefault: true },
    { ram: "32gb", storage: "1tb", color: "gray", price: 39990000 },
  ],
  "lenovo-legion-slim-5-16aph8": [{ ram: "16gb", storage: "512gb", color: "gray", price: 31490000, isDefault: true }],
  "lenovo-legion-pro-7-16irx9h": [{ ram: "32gb", storage: "1tb", color: "gray", price: 68990000, isDefault: true }],

  // --- 4. LENOVO THINKBOOK ---
  "lenovo-thinkbook-14-g6-abp": [{ ram: "16gb", storage: "512gb", color: "gray", price: 15990000, isDefault: true }],
  "lenovo-thinkbook-16-g6-irl": [
    { ram: "16gb", storage: "512gb", color: "gray", price: 19490000, isDefault: true },
    { ram: "16gb", storage: "1tb", color: "gray", price: 21490000 },
  ],

  // --- 5. LENOVO THINKPAD ---
  "lenovo-thinkpad-e14-gen-5": [{ ram: "16gb", storage: "512gb", color: "black", price: 22490000, isDefault: true }],
  "lenovo-thinkpad-l13-gen-4": [{ ram: "16gb", storage: "512gb", color: "black", price: 24990000, isDefault: true }],
  "lenovo-thinkpad-x1-carbon-gen-12": [{ ram: "32gb", storage: "1tb", color: "black", price: 56990000, isDefault: true }],

  // --- 6. LENOVO V-SERIES ---
  "lenovo-v15-g4-irn": [
    { ram: "8gb", storage: "256gb", color: "gray", price: 10290000, isDefault: true },
    { ram: "16gb", storage: "512gb", color: "gray", price: 12490000 },
  ],

  // --- 7. LENOVO YOGA ---
  "lenovo-yoga-7-14itp8": [{ ram: "16gb", storage: "512gb", color: "gray", price: 25990000, isDefault: true }],
  "lenovo-yoga-slim-7-14imh9": [{ ram: "32gb", storage: "1tb", color: "gray", price: 33990000, isDefault: true }],
  "lenovo-yoga-book-9-13iru8": [{ ram: "16gb", storage: "1tb", color: "gray", price: 54990000, isDefault: true }],

  // ================================================================
  // 6. MÁY LẠNH / ĐIỀU HÒA
  // ================================================================

  // ----------------------------------------------------------------
  // --- Comfee ---
  // ----------------------------------------------------------------

  "comfee-inverter-cfs-13vgp": [{ color: "white", price: 20990000, isDefault: true }],

  // ----------------------------------------------------------------
  // --- Casper ---
  // ----------------------------------------------------------------

  "casper-inverter-tc-09is35": [{ color: "white", price: 22990000, isDefault: true }],

  "casper-inverter-gc-12ib36": [{ color: "white", price: 21990000, isDefault: true }],

  "casper-inverter-gc-12is35": [{ color: "white", price: 23990000, isDefault: true }],

  // ================================================================
  // 7. TAI NGHE / EARPODS
  // ================================================================

  "apple-earpods-lightning": [{ color: "white", price: 590000, isDefault: true }],

  // apple-earpods-lightning-mmtn2za: slug riêng (model MMTN2ZA/A)
  "apple-earpods-lightning-mmtn2za": [{ color: "white", price: 590000, isDefault: true }],

  "apple-earpods-usb-c": [{ color: "white", price: 690000, isDefault: true }],

  "apple-airpods-pro-3": [{ color: "white", price: 6990000, isDefault: true }],
};

// ================================================================
// VARIANT IMAGES
//
// Key    → slug của product (khớp 1-1 với variantData)
// Value  → Record<color, string[]> — mảng đường dẫn ảnh theo màu
//
// THỨ TỰ đồng nhất với variantData (xem phần đầu file)
// ================================================================
export const variantImages: Record<string, Record<string, string[]>> = {
  // ================================================================
  // 1. IPHONE
  // ================================================================

  "iphone-13": {
    black: Array.from({ length: 5 }, (_, i) => `products/iphone/iphone-13/black/image-0${i + 1}.webp`),
    white: Array.from({ length: 5 }, (_, i) => `products/iphone/iphone-13/white/image-0${i + 1}.webp`),
    blue: Array.from({ length: 5 }, (_, i) => `products/iphone/iphone-13/blue/image-0${i + 1}.webp`),
    red: Array.from({ length: 5 }, (_, i) => `products/iphone/iphone-13/red/image-0${i + 1}.webp`),
    pink: Array.from({ length: 5 }, (_, i) => `products/iphone/iphone-13/pink/image-0${i + 1}.webp`),
    "alpine-green": Array.from({ length: 5 }, (_, i) => `products/iphone/iphone-13/alpine-green/image-0${i + 1}.webp`),
  },

  "iphone-14": {
    black: Array.from({ length: 5 }, (_, i) => `products/iphone/iphone-14/black/image-0${i + 1}.webp`),
    white: Array.from({ length: 5 }, (_, i) => `products/iphone/iphone-14/white/image-0${i + 1}.webp`),
  },

  "iphone-15": {
    black: Array.from({ length: 5 }, (_, i) => `products/iphone/iphone-15/black/image-0${i + 1}.webp`),
  },

  "iphone-16": {
    black: Array.from({ length: 5 }, (_, i) => `products/iphone/iphone-16/black/image-0${i + 1}.webp`),
  },

  "iphone-16-plus": {
    black: Array.from({ length: 5 }, (_, i) => `products/iphone/iphone-16-plus/black/image-0${i + 1}.webp`),
  },

  "iphone-16-pro-max": {
    "titan-black": Array.from({ length: 5 }, (_, i) => `products/iphone/iphone-16-pro-max/titan-black/image-0${i + 1}.webp`),
  },

  "iphone-17": {
    black: Array.from({ length: 5 }, (_, i) => `products/iphone/iphone-17/black/image-0${i + 1}.webp`),
  },

  "iphone-17-pro": {
    silver: Array.from({ length: 5 }, (_, i) => `products/iphone/iphone-17-pro/silver/image-0${i + 1}.webp`),
  },

  "iphone-17-pro-max": {
    orange: Array.from({ length: 5 }, (_, i) => `products/iphone/iphone-17-pro-max/orange/image-0${i + 1}.webp`),
  },

  // ================================================================
  // 2. SAMSUNG
  // ================================================================

  // ----------------------------------------------------------------
  // --- Galaxy Z Series ---
  // ----------------------------------------------------------------

  "samsung-galaxy-z-fold6-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/samsung-galaxy-z-fold6-5g/black/image-0${i + 1}.webp`),
  },

  "samsung-galaxy-z-fold7-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/samsung-galaxy-z-fold7-5g/black/image-0${i + 1}.webp`),
  },

  "samsung-galaxy-z-flip7-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/samsung-galaxy-z-flip7-5g/black/image-0${i + 1}.webp`),
  },

  // ----------------------------------------------------------------
  // --- Galaxy S Series ---
  // ----------------------------------------------------------------

  "samsung-galaxy-s24-fe-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/samsung-galaxy-s24-fe-5g/black/image-0${i + 1}.webp`),
  },

  "samsung-galaxy-s24-ultra-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/samsung-galaxy-s24-ultra-5g/black/image-0${i + 1}.webp`),
  },

  "samsung-galaxy-s25-fe-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/samsung-galaxy-s25-fe-5g/black/image-0${i + 1}.webp`),
  },

  "samsung-galaxy-s25-edge-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/samsung-galaxy-s25-edge-5g/black/image-0${i + 1}.webp`),
  },

  "samsung-galaxy-s25-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/samsung-galaxy-s25-5g/black/image-0${i + 1}.webp`),
  },

  "samsung-galaxy-s25-plus-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/samsung-galaxy-s25-plus-5g/black/image-0${i + 1}.webp`),
  },

  "samsung-galaxy-s25-ultra-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/samsung-galaxy-s25-ultra-5g/black/image-0${i + 1}.webp`),
  },

  // ----------------------------------------------------------------
  // --- Galaxy A Series ---
  // ----------------------------------------------------------------

  "samsung-galaxy-a06": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/galaxy-a-series/samsung-galaxy-a06/black/image-0${i + 1}.webp`),
  },

  "samsung-galaxy-a06-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/galaxy-a-series/samsung-galaxy-a06-5g/black/image-0${i + 1}.webp`),
  },

  "samsung-galaxy-a07": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/galaxy-a-series/samsung-galaxy-a07/black/image-0${i + 1}.webp`),
  },

  "samsung-galaxy-a07-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/galaxy-a-series/samsung-galaxy-a07-5g/black/image-0${i + 1}.webp`),
  },

  "samsung-galaxy-a16": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/galaxy-a-series/samsung-galaxy-a16/black/image-0${i + 1}.webp`),
  },

  "samsung-galaxy-a16-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/galaxy-a-series/samsung-galaxy-a16-5g/black/image-0${i + 1}.webp`),
  },

  "samsung-galaxy-a17": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/galaxy-a-series/samsung-galaxy-a17/black/image-0${i + 1}.webp`),
  },

  "samsung-galaxy-a17-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/galaxy-a-series/samsung-galaxy-a17-5g/black/image-0${i + 1}.webp`),
  },

  "samsung-galaxy-a26-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/galaxy-a-series/samsung-galaxy-a26-5g/black/image-0${i + 1}.webp`),
  },

  "samsung-galaxy-a36-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/galaxy-a-series/samsung-galaxy-a36-5g/black/image-0${i + 1}.webp`),
  },

  "samsung-galaxy-a56-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/galaxy-a-series/samsung-galaxy-a56-5g/black/image-0${i + 1}.webp`),
  },

  // ----------------------------------------------------------------
  // --- Galaxy M Series ---
  // ----------------------------------------------------------------

  "samsung-galaxy-m55-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/galaxy-m-series/samsung-galaxy-m55-5g/black/image-0${i + 1}.webp`),
  },

  // ----------------------------------------------------------------
  // --- Galaxy XCover Series ---
  // ----------------------------------------------------------------

  "samsung-galaxy-xcover7-pro-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/galaxy-xcover-series/samsung-galaxy-xcover7-pro-5g/black/image-0${i + 1}.webp`),
  },

  // ================================================================
  // 3. OPPO
  // ================================================================

  // ----------------------------------------------------------------
  // --- Reno Series ---
  // ----------------------------------------------------------------

  "oppo-reno11-f-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-reno-series/oppo-reno11-f-5g/black/image-0${i + 1}.webp`),
  },

  "oppo-reno12-f-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-reno-series/oppo-reno12-f-5g/black/image-0${i + 1}.webp`),
  },

  "oppo-reno13-f-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-reno-series/oppo-reno13-f-5g/black/image-0${i + 1}.webp`),
  },

  "oppo-reno14-f-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-reno-series/oppo-reno14-f-5g/black/image-0${i + 1}.webp`),
  },

  "oppo-reno14-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-reno-series/oppo-reno14-5g/black/image-0${i + 1}.webp`),
  },

  "oppo-reno15-f-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-reno-series/oppo-reno15-f-5g/black/image-0${i + 1}.webp`),
  },

  "oppo-reno15-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-reno-series/oppo-reno15-5g/black/image-0${i + 1}.webp`),
  },

  // ----------------------------------------------------------------
  // --- A Series ---
  // ----------------------------------------------------------------

  "oppo-a3": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-a-series/oppo-a3/black/image-0${i + 1}.webp`),
  },

  "oppo-a5i": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-a-series/oppo-a5i/black/image-0${i + 1}.webp`),
  },

  "oppo-a5i-pro": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-a-series/oppo-a5i-pro/black/image-0${i + 1}.webp`),
  },

  "oppo-a6t": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-a-series/oppo-a6t/black/image-0${i + 1}.webp`),
  },

  "oppo-a6-pro": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-a-series/oppo-a6-pro/black/image-0${i + 1}.webp`),
  },

  "oppo-a18": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-a-series/oppo-a18/black/image-0${i + 1}.webp`),
  },

  "oppo-a58": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-a-series/oppo-a58/black/image-0${i + 1}.webp`),
  },

  // ----------------------------------------------------------------
  // --- Find Series ---
  // ----------------------------------------------------------------

  "oppo-find-x9-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-find-series/oppo-find-x9-5g/black/image-0${i + 1}.webp`),
  },

  "oppo-find-x9-pro-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-find-series/oppo-find-x9-pro-5g/black/image-0${i + 1}.webp`),
  },

  "oppo-find-n3-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-find-series/oppo-find-n3-5g/black/image-0${i + 1}.webp`),
  },

  "oppo-find-n5-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/oppo/oppo-find-series/oppo-find-n5-5g/black/image-0${i + 1}.webp`),
  },

  // ================================================================
  // 4. XIAOMI
  // ================================================================

  // ----------------------------------------------------------------
  // --- POCO Series ---
  // ----------------------------------------------------------------

  "xiaomi-poco-c71": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-poco-series/xiaomi-poco-c71/black/image-0${i + 1}.webp`),
  },

  "xiaomi-poco-m6-pro": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-poco-series/xiaomi-poco-m6-pro/black/image-0${i + 1}.webp`),
  },

  "xiaomi-poco-m7-pro-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-poco-series/xiaomi-poco-m7-pro-5g/black/image-0${i + 1}.webp`),
  },

  "xiaomi-poco-x7-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-poco-series/xiaomi-poco-x7-5g/black/image-0${i + 1}.webp`),
  },

  "xiaomi-poco-f8-pro-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-poco-series/xiaomi-poco-f8-pro-5g/black/image-0${i + 1}.webp`),
  },

  // ----------------------------------------------------------------
  // --- Redmi Series ---
  // ----------------------------------------------------------------

  "xiaomi-redmi-13x": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-redmi-series/xiaomi-redmi-13x/black/image-0${i + 1}.webp`),
  },

  "xiaomi-redmi-14c": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-redmi-series/xiaomi-redmi-14c/black/image-0${i + 1}.webp`),
  },

  "xiaomi-redmi-15-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-redmi-series/xiaomi-redmi-15-5g/black/image-0${i + 1}.webp`),
  },

  // ----------------------------------------------------------------
  // --- Redmi Note Series ---
  // ----------------------------------------------------------------

  "xiaomi-redmi-note-14": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-redmi-note-series/xiaomi-redmi-note-14/black/image-0${i + 1}.webp`),
  },

  "xiaomi-redmi-note-14-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-redmi-note-series/xiaomi-redmi-note-14-5g/black/image-0${i + 1}.webp`),
  },

  "xiaomi-redmi-note-14-pro-plus-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-redmi-note-series/xiaomi-redmi-note-14-pro-plus-5g/black/image-0${i + 1}.webp`),
  },

  "xiaomi-redmi-note-15": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-redmi-note-series/xiaomi-redmi-note-15/black/image-0${i + 1}.webp`),
  },

  "xiaomi-redmi-note-15-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-redmi-note-series/xiaomi-redmi-note-15-5g/black/image-0${i + 1}.webp`),
  },

  "xiaomi-redmi-note-15-pro": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-redmi-note-series/xiaomi-redmi-note-15-pro/black/image-0${i + 1}.webp`),
  },

  "xiaomi-redmi-note-15-pro-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-redmi-note-series/xiaomi-redmi-note-15-pro-5g/black/image-0${i + 1}.webp`),
  },

  // ----------------------------------------------------------------
  // --- Xiaomi Flagship Series ---
  // ----------------------------------------------------------------

  "xiaomi-15-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-flagship-series/xiaomi-15-5g/black/image-0${i + 1}.webp`),
  },

  "xiaomi-15-ultra-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-flagship-series/xiaomi-15-ultra-5g/black/image-0${i + 1}.webp`),
  },

  "xiaomi-15t-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-flagship-series/xiaomi-15t-5g/black/image-0${i + 1}.webp`),
  },

  "xiaomi-15t-pro-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/xiaomi/xiaomi-flagship-series/xiaomi-15t-pro-5g/black/image-0${i + 1}.webp`),
  },

  // ================================================================
  // 5. MACBOOK AIR - KHỚP VỚI FOLDER THỰC TẾ
  // ================================================================

  // --- MacBook Air 13 inch ---
  "macbook-air-13-m2": {
    black: Array.from({ length: 5 }, (_, i) => `products/macbook/macbook-air-13-inch/macbook-air-13-m2/black/image-0${i + 1}.webp`),
  },

  "macbook-air-13-m3": {
    black: Array.from({ length: 5 }, (_, i) => `products/macbook/macbook-air-13-inch/macbook-air-13-m3/black/image-0${i + 1}.webp`),
  },

  "macbook-air-13-m5": {
    black: Array.from({ length: 5 }, (_, i) => `products/macbook/macbook-air-13-inch/macbook-air-13-m5/black/image-0${i + 1}.webp`),
  },

  // --- MacBook Air 15 inch ---
  "macbook-air-15-m3": {
    black: Array.from({ length: 5 }, (_, i) => `products/macbook/macbook-air-15-inch/macbook-air-15-m3/black/image-0${i + 1}.webp`),
  },

  "macbook-air-15-m5": {
    black: Array.from({ length: 5 }, (_, i) => `products/macbook/macbook-air-15-inch/macbook-air-15-m5/black/image-0${i + 1}.webp`),
  },

  // ================================================================
  // 6. MACBOOK PRO - KHỚP VỚI FOLDER THỰC TẾ
  // ================================================================

  // --- MacBook Pro 14 inch ---
  "macbook-pro-14-m4": {
    black: Array.from({ length: 5 }, (_, i) => `products/macbook/macbook-pro-14-inch/macbook-pro-14-m4/black/image-0${i + 1}.webp`),
  },

  "macbook-pro-14-m4-pro": {
    black: Array.from({ length: 5 }, (_, i) => `products/macbook/macbook-pro-14-inch/macbook-pro-14-m4-pro/black/image-0${i + 1}.webp`),
  },

  "macbook-pro-14-m5-pro": {
    black: Array.from({ length: 5 }, (_, i) => `products/macbook/macbook-pro-14-inch/macbook-pro-14-m5-pro/black/image-0${i + 1}.webp`),
  },

  "macbook-pro-14-m5-max": {
    black: Array.from({ length: 5 }, (_, i) => `products/macbook/macbook-pro-14-inch/macbook-pro-14-m5-max/black/image-0${i + 1}.webp`),
  },

  // --- MacBook Pro 16 inch ---
  "macbook-pro-16-m4-pro": {
    black: Array.from({ length: 5 }, (_, i) => `products/macbook/macbook-pro-16-inch/macbook-pro-16-m4-pro/black/image-0${i + 1}.webp`),
  },

  "macbook-pro-16-m4-max": {
    black: Array.from({ length: 5 }, (_, i) => `products/macbook/macbook-pro-16-inch/macbook-pro-16-m4-max/black/image-0${i + 1}.webp`),
  },

  "macbook-pro-16-m5-pro": {
    black: Array.from({ length: 5 }, (_, i) => `products/macbook/macbook-pro-16-inch/macbook-pro-16-m5-pro/black/image-0${i + 1}.webp`),
  },

  "macbook-pro-16-m5-max": {
    black: Array.from({ length: 5 }, (_, i) => `products/macbook/macbook-pro-16-inch/macbook-pro-16-m5-max/black/image-0${i + 1}.webp`),
  },

  // ================================================================
  // 6. MÁY LẠNH / ĐIỀU HÒA
  // ================================================================

  // ----------------------------------------------------------------
  // --- Comfee ---
  // ----------------------------------------------------------------

  "comfee-inverter-cfs-13vgp": {
    white: Array.from({ length: 5 }, (_, i) => `products/air-conditioner/comfee-inverter-cfs-13vgp/white/image-0${i + 1}.webp`),
  },

  // ----------------------------------------------------------------
  // --- Casper ---
  // ----------------------------------------------------------------

  "casper-inverter-tc-09is35": {
    white: Array.from({ length: 5 }, (_, i) => `products/air-conditioner/casper-inverter-tc-09is35/white/image-0${i + 1}.webp`),
  },

  "casper-inverter-gc-12ib36": {
    white: Array.from({ length: 5 }, (_, i) => `products/air-conditioner/casper-inverter-gc-12ib36/white/image-0${i + 1}.webp`),
  },

  "casper-inverter-gc-12is35": {
    white: Array.from({ length: 5 }, (_, i) => `products/air-conditioner/casper-inverter-gc-12is35/white/image-0${i + 1}.webp`),
  },

  // ================================================================
  // 7. TAI NGHE / EARPODS
  // ================================================================

  "apple-earpods-lightning": {
    white: Array.from({ length: 5 }, (_, i) => `products/headphones/apple-earpods-lightning/white/image-0${i + 1}.webp`),
  },

  "apple-earpods-lightning-mmtn2za": {
    white: Array.from({ length: 5 }, (_, i) => `products/headphones/apple-earpods-lightning-mmtn2za/white/image-0${i + 1}.webp`),
  },

  "apple-earpods-usb-c": {
    white: Array.from({ length: 5 }, (_, i) => `products/headphones/apple-earpods-usb-c/white/image-0${i + 1}.webp`),
  },

  "apple-airpods-pro-3": {
    white: Array.from({ length: 5 }, (_, i) => `products/headphones/apple-airpods-pro-3/white/image-0${i + 1}.webp`),
  },
};
