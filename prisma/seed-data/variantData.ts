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
    { ram: "16gb", storage: "512gb", color: "black", price: 18990000, isDefault: true },
    { ram: "16gb", storage: "1tb", color: "black", price: 20490000 },
  ],
  "lenovo-loq-15irp9": [
    { ram: "16gb", storage: "512gb", color: "black", price: 23490000, isDefault: true },
    { ram: "24gb", storage: "512gb", color: "black", price: 25990000 },
  ],

  // --- 2. LENOVO IDEAPAD ---
  "lenovo-ideapad-1-15amn7": [
    { ram: "8gb", storage: "256gb", color: "black", price: 8490000, isDefault: true },
    { ram: "16gb", storage: "512gb", color: "black", price: 11990000 },
  ],
  "lenovo-ideapad-slim-3-15iau7": [{ ram: "16gb", storage: "512gb", color: "black", price: 13490000, isDefault: true }],
  "lenovo-ideapad-slim-5-14iml9": [
    { ram: "16gb", storage: "512gb", color: "black", price: 18490000, isDefault: true },
    { ram: "32gb", storage: "1tb", color: "black", price: 22990000 },
  ],

  // --- 3. LENOVO LEGION GAMING ---
  "lenovo-legion-5-16irx9": [
    { ram: "16gb", storage: "512gb", color: "black", price: 34990000, isDefault: true },
    { ram: "32gb", storage: "1tb", color: "black", price: 39990000 },
  ],
  "lenovo-legion-slim-5-16aph8": [{ ram: "16gb", storage: "512gb", color: "black", price: 31490000, isDefault: true }],
  "lenovo-legion-pro-7-16irx9h": [{ ram: "32gb", storage: "1tb", color: "black", price: 68990000, isDefault: true }],

  // --- 4. LENOVO THINKBOOK ---
  "lenovo-thinkbook-14-g6-abp": [{ ram: "16gb", storage: "512gb", color: "black", price: 15990000, isDefault: true }],
  "lenovo-thinkbook-16-g6-irl": [
    { ram: "16gb", storage: "512gb", color: "black", price: 19490000, isDefault: true },
    { ram: "16gb", storage: "1tb", color: "black", price: 21490000 },
  ],

  // --- 5. LENOVO THINKPAD ---
  "lenovo-thinkpad-e14-gen-5": [{ ram: "16gb", storage: "512gb", color: "black", price: 22490000, isDefault: true }],
  "lenovo-thinkpad-l13-gen-4": [{ ram: "16gb", storage: "512gb", color: "black", price: 24990000, isDefault: true }],
  "lenovo-thinkpad-x1-carbon-gen-12": [{ ram: "32gb", storage: "1tb", color: "black", price: 56990000, isDefault: true }],

  // --- 6. LENOVO V-SERIES ---
  "lenovo-v15-g4-irn": [
    { ram: "8gb", storage: "256gb", color: "black", price: 10290000, isDefault: true },
    { ram: "16gb", storage: "512gb", color: "black", price: 12490000 },
  ],

  // --- 7. LENOVO YOGA ---
  "lenovo-yoga-7-14itp8": [{ ram: "16gb", storage: "512gb", color: "black", price: 25990000, isDefault: true }],
  "lenovo-yoga-slim-7-14imh9": [{ ram: "32gb", storage: "1tb", color: "black", price: 33990000, isDefault: true }],
  "lenovo-yoga-book-9-13iru8": [{ ram: "16gb", storage: "1tb", color: "black", price: 54990000, isDefault: true }],

  // ===============================================================
  // 8. DELL
  // ===============================================================

  // --- 1. DELL XPS ---
  "dell-xps-13-9340": [
    { ram: "16gb", storage: "512gb", color: "black", price: 42990000, isDefault: true },
    { ram: "32gb", storage: "1tb", color: "black", price: 49990000 },
  ],
  "dell-xps-14-9440": [
    { ram: "16gb", storage: "512gb", color: "black", price: 54990000, isDefault: true },
    { ram: "32gb", storage: "1tb", color: "black", price: 62490000 },
  ],

  // --- 2. DELL INSPIRON ---
  "dell-inspiron-14-5440": [
    { ram: "16gb", storage: "512gb", color: "black", price: 17490000, isDefault: true },
    { ram: "16gb", storage: "1tb", color: "black", price: 19990000 },
  ],
  "dell-inspiron-16-5640": [{ ram: "16gb", storage: "512gb", color: "black", price: 21990000, isDefault: true }],

  // --- 3. DELL LATITUDE ---
  "dell-latitude-3440": [
    { ram: "8gb", storage: "256gb", color: "black", price: 14990000, isDefault: true },
    { ram: "16gb", storage: "512gb", color: "black", price: 17290000 },
  ],
  "dell-latitude-7440": [{ ram: "16gb", storage: "512gb", color: "black", price: 32490000, isDefault: true }],

  // --- 4. DELL 15 (VOSTRO/SERIES 15) ---
  "dell-vostro-15-3530": [
    { ram: "8gb", storage: "512gb", color: "black", price: 13990000, isDefault: true },
    { ram: "16gb", storage: "512gb", color: "black", price: 15490000 },
  ],

  // --- 5. DELL 16 (PRECISION/SERIES 16) ---
  "dell-precision-16-5680": [{ ram: "32gb", storage: "1tb", color: "black", price: 75990000, isDefault: true }],

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
