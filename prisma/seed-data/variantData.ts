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
  capacity_fridge?: string; // → variants_attributes { key: "capacity_fridge", value: "1-2hp" }
  capacity_washing?: string; // → variants_attributes { key: "capacity_washing", value: "kg" }
  connection?: string; // → variants_attributes { key: "connection", value: "wifi" }
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
    { storage: "256gb", color: "black", price: 49990000, isDefault: true },
    { storage: "512gb", color: "black", price: 52990000 },
  ],

  "iphone-17-pro": [
    { storage: "256gb", color: "silver", price: 53990000, isDefault: true },
    { storage: "512gb", color: "silver", price: 56990000 },
  ],

  "iphone-17-pro-max": [
    { storage: "256gb", color: "orange", price: 56990000, isDefault: true },
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

  // ===============================================================
  // 9. ASUS
  // ===============================================================

  // --- 1. ASUS ZENBOOK ---
  "asus-zenbook-14-oled-ux3405": [
    { ram: "16gb", storage: "512gb", color: "black", price: 28990000, isDefault: true },
    { ram: "32gb", storage: "1tb", color: "black", price: 34990000 },
  ],
  "asus-zenbook-s-13-oled-ux5304": [{ ram: "16gb", storage: "512gb", color: "white", price: 31990000, isDefault: true }],

  // --- 2. ASUS VIVOBOOK ---
  "asus-vivobook-15-x1504": [
    { ram: "8gb", storage: "512gb", color: "black", price: 12490000, isDefault: true },
    { ram: "16gb", storage: "512gb", color: "black", price: 13990000 },
  ],
  "asus-vivobook-go-14-e1404": [{ ram: "8gb", storage: "256gb", color: "black", price: 8990000, isDefault: true }],

  // --- 3. ASUS TUF GAMING ---
  "asus-tuf-gaming-a15-fa506": [{ ram: "16gb", storage: "512gb", color: "black", price: 18990000, isDefault: true }],
  "asus-tuf-gaming-f15-fx507": [
    { ram: "16gb", storage: "512gb", color: "white", price: 24490000, isDefault: true },
    { ram: "16gb", storage: "1tb", color: "white", price: 26990000 },
  ],

  // --- 4. ASUS ROG ---
  "asus-rog-strix-g16-g614": [
    { ram: "16gb", storage: "512gb", color: "black", price: 35990000, isDefault: true },
    { ram: "32gb", storage: "1tb", color: "black", price: 42990000 },
  ],
  "asus-rog-zephyrus-g14-ga403": [{ ram: "32gb", storage: "1tb", color: "white", price: 54990000, isDefault: true }],

  // --- 5. ASUS V16 GAMING ---
  "asus-v16-gaming-v161": [{ ram: "8gb", storage: "256gb", color: "black", price: 15990000, isDefault: true }],

  // ===============================================================
  // 10. ACER
  // ===============================================================

  // --- 1. ACER ASPIRE ---
  "acer-aspire-3-a315": [
    { ram: "8gb", storage: "256gb", color: "white", price: 9490000, isDefault: true },
    { ram: "16gb", storage: "512gb", color: "white", price: 11990000 },
  ],
  "acer-aspire-5-a515": [{ ram: "16gb", storage: "512gb", color: "black", price: 14490000, isDefault: true }],

  // --- 2. ACER ASPIRE GAMING ---
  "acer-aspire-7-gaming-a715": [{ ram: "16gb", storage: "512gb", color: "black", price: 17990000, isDefault: true }],

  // --- 3. ACER NITRO ---
  "acer-nitro-5-tiger-an515": [
    { ram: "16gb", storage: "512gb", color: "black", price: 22990000, isDefault: true },
    { ram: "16gb", storage: "1tb", color: "black", price: 25490000 },
  ],

  // --- 4. ACER NITRO V PROPANEL ---
  "acer-nitro-v-15-anv15": [{ ram: "16gb", storage: "512gb", color: "black", price: 21490000, isDefault: true }],

  // --- 5. ACER SWIFT ---
  "acer-swift-go-14-sfg14": [
    { ram: "16gb", storage: "512gb", color: "white", price: 19990000, isDefault: true },
    { ram: "32gb", storage: "1tb", color: "white", price: 24990000 },
  ],

  // --- 6. ACER PREDATOR ---
  "acer-predator-helios-neo-16-phn16": [
    { ram: "16gb", storage: "512gb", color: "black", price: 34990000, isDefault: true },
    { ram: "32gb", storage: "1tb", color: "black", price: 41990000 },
  ],

  // ===============================================================
  // 11. HP
  // ===============================================================

  // --- 1. HP 14/15 - 14S/15S ---
  "hp-15s-fq5111tu": [
    { ram: "8gb", storage: "256gb", color: "white", price: 10490000, isDefault: true },
    { ram: "16gb", storage: "512gb", color: "white", price: 13290000 },
  ],

  // --- 2. HP PROBOOK ---
  "hp-probook-450-g10": [{ ram: "16gb", storage: "512gb", color: "white", price: 20990000, isDefault: true }],

  // --- 3. HP ENVY ---
  "hp-envy-x360-14-fa0045au": [{ ram: "16gb", storage: "512gb", color: "black", price: 24990000, isDefault: true }],

  // --- 4. HP VICTUS ---
  "hp-victus-15-fa1139tx": [{ ram: "16gb", storage: "512gb", color: "black", price: 18990000, isDefault: true }],

  // --- 5. HP OMEN ---
  "hp-omen-16-xf0071ax": [{ ram: "32gb", storage: "1tb", color: "black", price: 44990000, isDefault: true }],

  // --- 6. HP OMNIBOOK 5/7/U/X ---
  "hp-omnibook-x-14-fe0053au": [{ ram: "16gb", storage: "1tb", color: "white", price: 30990000, isDefault: true }],
  "hp-omnibook-ultra-flip-14": [{ ram: "32gb", storage: "1tb", color: "black", price: 45990000, isDefault: true }],

  // ===============================================================
  // 12. TIVI
  // ===============================================================

  // --- 1. TIVI QLED ---
  "samsung-qled-4k-65q70c": [{ size: "65-inch", price: 18900000, isDefault: true }],
  "tcl-qled-4k-55c645": [{ size: "55-inch", price: 9990000, isDefault: true }],

  // --- 2. TIVI 4K ---
  "sony-4k-google-tv-55x75k": [{ size: "55-inch", price: 12490000, isDefault: true }],
  "samsung-crystal-4k-50au7700": [{ size: "50-inch", price: 8990000, isDefault: true }],

  // --- 3. GOOGLE TV ---
  "xiaomi-google-tv-a-pro-55": [{ size: "55-inch", price: 7990000, isDefault: true }],
  "coocaa-google-tv-70y72": [{ size: "70-inch", price: 11590000, isDefault: true }],

  // ===============================================================
  // 13. ĐIỀU HÒA
  // ===============================================================

  // --- 1. ĐIỀU HÒA 1 CHIỀU ---
  "daikin-1-chieu-atf25uv1v": [
    { color: "white", capacity_cooling: "1hp", price: 9490000, isDefault: true },
    { color: "white", capacity_cooling: "1-5hp", price: 11990000 },
  ],
  "panasonic-1-chieu-n9zkh-8": [{ color: "white", capacity_cooling: "1hp", price: 10190000, isDefault: true }],

  // --- 2. ĐIỀU HÒA 2 CHIỀU ---
  "daikin-2-chieu-inverter-f25vavmv": [
    { color: "white", capacity_cooling: "1hp", price: 13990000, isDefault: true },
    { color: "white", capacity_cooling: "1-5hp", price: 16490000 },
  ],
  "panasonic-2-chieu-inverter-yz9wkh-8": [{ color: "white", capacity_cooling: "1hp", price: 14590000, isDefault: true }],

  // --- 3. ĐIỀU HÒA INVERTER ---
  "samsung-inverter-ar10cyh": [
    { color: "white", capacity_cooling: "1hp", price: 8490000, isDefault: true },
    { color: "white", capacity_cooling: "1-5hp", price: 10290000 },
  ],
  "casper-inverter-tc-09is33": [{ color: "white", capacity_cooling: "1hp", price: 5990000, isDefault: true }],

  // ===============================================================
  // 14. TỦ LẠNH
  // ===============================================================

  // --- 1. TỦ LẠNH INVERTER ---
  "samsung-inverter-236l-rt22farbdsa": [
    { capacity_fridge: "236l", color: "white", price: 6490000, isDefault: true },
    { capacity_fridge: "236l", color: "black", price: 6790000 },
  ],
  "panasonic-inverter-255l-nr-bv280qs": [{ capacity_fridge: "255l", color: "white", price: 8990000, isDefault: true }],

  // --- 2. TỦ LẠNH NHIỀU CỬA (MULTI DOOR) ---
  "casper-multi-door-430l-rm-520vt": [{ capacity_fridge: "430l", color: "white", price: 12990000, isDefault: true }],
  "sharp-inverter-401l-sj-fx52gp-bk": [{ capacity_fridge: "401l", color: "black", price: 15490000, isDefault: true }],

  // --- 3. SIDE BY SIDE ---
  "samsung-side-by-side-648l-rs64r5301b4": [{ capacity_fridge: "648l", color: "black", price: 17490000, isDefault: true }],
  "lg-side-by-side-635l-gr-d257js": [{ capacity_fridge: "635l", color: "white", price: 23990000, isDefault: true }],

  // ===============================================================
  // 15. MÁY GIẶT CỬA
  // ===============================================================
  // --- 1. MÁY GIẶT CỬA TRƯỚC ---
  "lg-inverter-9kg-fv1409s4w": [
    { capacity_washing: "9kg", color: "white", price: 8990000, isDefault: true },
    { capacity_washing: "9kg", color: "black", price: 9490000 },
  ],
  "samsung-ai-inverter-10kg-ww10tp44ds": [{ capacity_washing: "10kg", color: "black", price: 11490000, isDefault: true }],
  "electrolux-inverter-11kg-ewf1142bewa": [{ capacity_washing: "11kg", color: "white", price: 14990000, isDefault: true }],

  // --- 2. MÁY GIẶT CỬA TRÊN ---
  "panasonic-inverter-8.5kg-na-fd85x1lrv": [{ capacity_washing: "8kg", color: "black", price: 7290000, isDefault: true }],
  "toshiba-7kg-aw-k800av": [{ capacity_washing: "7kg", color: "white", price: 4990000, isDefault: true }],
  "aqua-12kg-aqw-fw120gt-bk": [{ capacity_washing: "12kg", color: "black", price: 8590000, isDefault: true }],

  // --- 3. MÁY GIẶT SẤY ---
  "samsung-giat-say-14kg-wd14tp44dsx": [{ capacity_washing: "14kg", color: "black", price: 19990000, isDefault: true }],
  "lg-giat-say-10.5kg-fv1450h2b": [
    { capacity_washing: "10kg", color: "black", price: 15990000, isDefault: true },
    { capacity_washing: "10kg", color: "white", price: 15490000 },
  ],

  // ===============================================================
  // 16. SẤY THÔNG HƠI
  // ===============================================================

  // --- 1. SẤY THÔNG HƠI ---
  "electrolux-thong-hoi-8.5kg-eds854n3sb": [
    { capacity_washing: "8kg", color: "black", price: 9490000, isDefault: true },
    { capacity_washing: "8kg", color: "white", price: 8990000 },
  ],
  "casper-thong-hoi-7.2kg-td-72vwd": [{ capacity_washing: "7kg", color: "white", price: 5490000, isDefault: true }],

  // --- 2. SẤY NGƯNG TỤ ---
  "candy-ngung-tu-9kg-cso-c9te-s": [{ capacity_washing: "9kg", color: "white", price: 9990000, isDefault: true }],
  "lg-ngung-tu-8kg-fc1408s4w2": [{ capacity_washing: "8kg", color: "white", price: 11490000, isDefault: true }],

  // --- 3. SẤY BƠM NHIỆT (HEAT PUMP) ---
  "samsung-heatpump-9kg-dv90ta240ae": [{ capacity_washing: "9kg", color: "white", price: 14490000, isDefault: true }],
  "lg-heatpump-9kg-dvhp09b": [
    { capacity_washing: "9kg", color: "black", price: 17990000, isDefault: true },
    { capacity_washing: "10kg", color: "black", price: 19490000 },
  ],

  // ===============================================================
  // 17. TỦ ĐÔNG
  // ===============================================================

  // --- 1. TỦ ĐÔNG 1 NGĂN ĐÔNG ---
  "sanaky-1-ngan-dong-100l-vh-1599hy": [{ capacity_fridge: "100l", color: "white", price: 3990000, isDefault: true }],
  "kangaroo-1-ngan-dong-140l-kg168nc1": [{ capacity_fridge: "140l", color: "white", price: 4590000, isDefault: true }],

  // --- 2. TỦ ĐÔNG 2 NGĂN (ĐÔNG - MÁT) ---
  "sanaky-2-ngan-280l-vh-2899w3": [{ capacity_fridge: "280l", color: "white", price: 7490000, isDefault: true }],
  "sunhouse-2-ngan-250l-shr-f2272w2": [{ capacity_fridge: "250l", color: "white", price: 6290000, isDefault: true }],

  // --- 3. TỦ ĐÔNG ĐỨNG ---
  "alaska-dung-210l-if-21": [{ capacity_fridge: "210l", color: "white", price: 8290000, isDefault: true }],
  "hoa-phat-dung-106l-hcf-106s1n": [{ capacity_fridge: "106l", color: "white", price: 3690000, isDefault: true }],

  // ===============================================================
  // 18. TAI NGHE
  // ===============================================================

  // --- 1. TAI NGHE NHÉT TAI / KHÔNG DÂY ---
  "apple-airpods-pro-2-usb-c": [{ connection: "wireless", color: "white", price: 5990000, isDefault: true }],
  "samsung-galaxy-buds-3-pro": [
    { connection: "wireless", color: "white", price: 4990000, isDefault: true },
    { connection: "wireless", color: "black", price: 4990000 },
  ],
  "sony-ier-h500a-3.5mm": [{ connection: "3-5mm", color: "black", price: 1290000, isDefault: true }],

  // --- 2. TAI NGHE CHỤP TAI ---
  "sony-wh-1000xm5": [
    { connection: "wireless", color: "black", price: 8490000, isDefault: true },
    { connection: "wireless", color: "white", price: 8490000 },
  ],
  "marshall-major-v": [{ connection: "wireless", color: "black", price: 4190000, isDefault: true }],

  // --- 3. LOA BLUETOOTH / VI TÍNH ---
  "jbl-charge-5": [{ connection: "wireless", color: "black", price: 3990000, isDefault: true }],
  "marshall-emberton-ii": [{ connection: "wireless", color: "black", price: 4490000, isDefault: true }],
  "microlab-x2-2.1": [{ connection: "3-5mm", color: "black", price: 1590000, isDefault: true }],

  // --- 4. LOA KARAOKE ---
  "dalton-ts-12g450x": [{ connection: "wireless", color: "black", price: 6890000, isDefault: true }],

  // ===============================================================
  // 19. CONSOLE
  // ===============================================================

  // --- 1. THIẾT BỊ CHƠI GAME (CONSOLE) ---
  "sony-playstation-5-slim": [
    { storage: "1tb", color: "white", price: 12490000, isDefault: true },
    { storage: "2tb", color: "white", price: 14990000 },
  ],
  "nintendo-switch-oled": [
    { storage: "64gb", color: "white", price: 7490000, isDefault: true },
    { storage: "64gb", color: "black", price: 7490000 },
  ],

  // --- 2. CHUỘT GAMING ---
  "logitech-g-pro-x-superlight-2": [
    { connection: "wireless", color: "white", price: 3490000, isDefault: true },
    { connection: "wireless", color: "black", price: 3490000 },
  ],
  "razer-deathadder-v3-pro": [{ connection: "wireless", color: "black", price: 3690000, isDefault: true }],

  // --- 3. BÀN PHÍM GAMING ---
  "asus-rog-falchion-rx-low-profile": [{ connection: "wireless", color: "white", price: 3990000, isDefault: true }],
  "corsair-k70-rgb-tkl": [{ connection: "usb-c", color: "black", price: 2990000, isDefault: true }],

  // --- 4. TAI NGHE & LOA GAMING ---
  "razer-blackshark-v2-pro": [{ connection: "wireless", color: "black", price: 4290000, isDefault: true }],
  "logitech-g560-lightsync-speakers": [{ connection: "usb-c", color: "black", price: 4990000, isDefault: true }],

  // ===============================================================
  // 20. CÁP, SẠC
  // ===============================================================

  // --- 1. SẠC, CÁP ---
  "apple-adapter-usb-c-20w": [{ connection: "usb-c", color: "white", price: 549000, isDefault: true }],
  "cap-usb-c-to-lightning-apple-1m": [{ connection: "lightning", color: "white", price: 549000, isDefault: true }],

  // --- 2. SẠC DỰ PHÒNG ---
  "sac-du-phong-samsung-10000mah-25w": [{ connection: "usb-c", color: "black", price: 890000, isDefault: true }],
  "sac-du-phong-maggo-anker-10000mah": [
    { connection: "wireless", color: "white", price: 1290000, isDefault: true },
    { connection: "wireless", color: "black", price: 1290000 },
  ],

  // --- 3. BAO DA, ỐP LƯNG ---
  "op-lung-iphone-15-pro-max-magsafe-silicone": [{ color: "black", price: 1420000, isDefault: true }],

  // --- 4. MIẾNG DÁN MÀN HÌNH ---
  "mieng-dan-kinh-cuong-luc-iphone-15-pro-max-miking": [{ color: "white", price: 290000, isDefault: true }],

  // --- 5. BÚT CẢM ỨNG ---
  "apple-pencil-pro": [{ connection: "wireless", color: "white", price: 3490000, isDefault: true }],

  // ===============================================================
  // 21. PHỤ KIỆN Laptop
  // ===============================================================

  // --- 1. CHUỘT & BÀN PHÍM ---
  "chuot-logitech-mx-master-3s": [
    { connection: "wireless", color: "black", price: 2490000, isDefault: true },
    { connection: "wireless", color: "white", price: 2490000 },
  ],
  "ban-phim-logitech-mx-keys-s": [{ connection: "wireless", color: "black", price: 2990000, isDefault: true }],

  // --- 2. BALO, TÚI XÁCH ---
  "balo-laptop-targus-15.6-inch": [{ color: "black", price: 1290000, isDefault: true }],

  // --- 3. PHỤ KIỆN TRÌNH CHIẾU & WEBCAM ---
  "but-trinh-chieu-logitech-r500s": [{ connection: "wireless", color: "black", price: 790000, isDefault: true }],
  "webcam-logitech-c922-pro": [{ connection: "usb-c", color: "black", price: 2290000, isDefault: true }],

  // --- 4. HUB & GIÁ ĐỠ ---
  "hub-chuyen-doi-anker-5-in-1-usb-c": [{ connection: "usb-c", color: "black", price: 950000, isDefault: true }],
  "gia-do-laptop-hyperwork-l01": [{ color: "white", price: 550000, isDefault: true }],

  // --- 5. LÓT CHUỘT & PHỦ BÀN PHÍM ---
  "mieng-lot-chuot-logitech-desk-mat": [{ color: "black", price: 450000, isDefault: true }],
  "phu-ban-phim-macbook-jcpal": [{ color: "white", price: 250000, isDefault: true }],
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
