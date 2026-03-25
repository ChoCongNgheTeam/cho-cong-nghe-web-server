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
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/galaxy-s-series/samsung-galaxy-s24-fe-5g/black/image-0${i + 1}.webp`),
  },

  "samsung-galaxy-s24-ultra-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/galaxy-s-series/samsung-galaxy-s24-ultra-5g/black/image-0${i + 1}.webp`),
  },

  "samsung-galaxy-s25-fe-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/galaxy-s-series/samsung-galaxy-s25-fe-5g/black/image-0${i + 1}.webp`),
  },

  "samsung-galaxy-s25-edge-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/galaxy-s-series/samsung-galaxy-s25-edge-5g/black/image-0${i + 1}.webp`),
  },

  "samsung-galaxy-s25-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/galaxy-s-series/samsung-galaxy-s25-5g/black/image-0${i + 1}.webp`),
  },

  "samsung-galaxy-s25-plus-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/galaxy-s-series/samsung-galaxy-s25-plus-5g/black/image-0${i + 1}.webp`),
  },

  "samsung-galaxy-s25-ultra-5g": {
    black: Array.from({ length: 5 }, (_, i) => `products/samsung/galaxy-s-series/samsung-galaxy-s25-ultra-5g/black/image-0${i + 1}.webp`),
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

  // ===============================================================
  // LENOVO
  // ===============================================================

  // ===============================================================
  // LENOVO IMAGE MAPPING DATA
  // ===============================================================

  // --- 1. LENOVO GAMING LOQ ---
  "lenovo-loq-15iax9e": {
    black: Array.from({ length: 5 }, (_, i) => `products/lenovo/lenovo-gaming-loq/lenovo-loq-15iax9e/black/image-0${i + 1}.webp`),
  },
  "lenovo-loq-15irp9": {
    black: Array.from({ length: 5 }, (_, i) => `products/lenovo/lenovo-gaming-loq/lenovo-loq-15irp9/black/image-0${i + 1}.webp`),
  },

  // --- 2. LENOVO IDEAPAD ---
  "lenovo-ideapad-1-15amn7": {
    black: Array.from({ length: 5 }, (_, i) => `products/lenovo/lenovo-ideapad/lenovo-ideapad-1-15amn7/black/image-0${i + 1}.webp`),
  },
  "lenovo-ideapad-slim-3-15iau7": {
    black: Array.from({ length: 5 }, (_, i) => `products/lenovo/lenovo-ideapad/lenovo-ideapad-slim-3-15iau7/black/image-0${i + 1}.webp`),
  },
  "lenovo-ideapad-slim-5-14iml9": {
    black: Array.from({ length: 5 }, (_, i) => `products/lenovo/lenovo-ideapad/lenovo-ideapad-slim-5-14iml9/black/image-0${i + 1}.webp`),
  },

  // --- 3. LENOVO LEGION GAMING ---
  "lenovo-legion-5-16irx9": {
    black: Array.from({ length: 5 }, (_, i) => `products/lenovo/lenovo-legion-gaming/lenovo-legion-5-16irx9/black/image-0${i + 1}.webp`),
  },
  "lenovo-legion-slim-5-16aph8": {
    black: Array.from({ length: 5 }, (_, i) => `products/lenovo/lenovo-legion-gaming/lenovo-legion-slim-5-16aph8/black/image-0${i + 1}.webp`),
  },
  "lenovo-legion-pro-7-16irx9h": {
    black: Array.from({ length: 5 }, (_, i) => `products/lenovo/lenovo-legion-gaming/lenovo-legion-pro-7-16irx9h/black/image-0${i + 1}.webp`),
  },

  // --- 4. LENOVO THINKBOOK ---
  "lenovo-thinkbook-14-g6-abp": {
    black: Array.from({ length: 5 }, (_, i) => `products/lenovo/lenovo-thinkbook/lenovo-thinkbook-14-g6-abp/black/image-0${i + 1}.webp`),
  },
  "lenovo-thinkbook-16-g6-irl": {
    black: Array.from({ length: 5 }, (_, i) => `products/lenovo/lenovo-thinkbook/lenovo-thinkbook-16-g6-irl/black/image-0${i + 1}.webp`),
  },

  // --- 5. LENOVO THINKPAD ---
  "lenovo-thinkpad-e14-gen-5": {
    black: Array.from({ length: 5 }, (_, i) => `products/lenovo/lenovo-thinkpad/lenovo-thinkpad-e14-gen-5/black/image-0${i + 1}.webp`),
  },
  "lenovo-thinkpad-l13-gen-4": {
    black: Array.from({ length: 5 }, (_, i) => `products/lenovo/lenovo-thinkpad/lenovo-thinkpad-l13-gen-4/black/image-0${i + 1}.webp`),
  },
  "lenovo-thinkpad-x1-carbon-gen-12": {
    black: Array.from({ length: 5 }, (_, i) => `products/lenovo/lenovo-thinkpad/lenovo-thinkpad-x1-carbon-gen-12/black/image-0${i + 1}.webp`),
  },

  // --- 6. LENOVO V-SERIES ---
  "lenovo-v15-g4-irn": {
    black: Array.from({ length: 5 }, (_, i) => `products/lenovo/lenovo-v-series/lenovo-v15-g4-irn/black/image-0${i + 1}.webp`),
  },

  // --- 7. LENOVO YOGA ---
  "lenovo-yoga-7-14itp8": {
    black: Array.from({ length: 5 }, (_, i) => `products/lenovo/lenovo-yoga/lenovo-yoga-7-14itp8/black/image-0${i + 1}.webp`),
  },
  "lenovo-yoga-slim-7-14imh9": {
    black: Array.from({ length: 5 }, (_, i) => `products/lenovo/lenovo-yoga/lenovo-yoga-slim-7-14imh9/black/image-0${i + 1}.webp`),
  },
  "lenovo-yoga-book-9-13iru8": {
    black: Array.from({ length: 5 }, (_, i) => `products/lenovo/lenovo-yoga/lenovo-yoga-book-9-13iru8/black/image-0${i + 1}.webp`),
  },

  // --- 1. DELL XPS ---
  "dell-xps-13-9340": {
    black: Array.from({ length: 5 }, (_, i) => `products/dell/dell-xps/dell-xps-13-9340/black/image-0${i + 1}.webp`),
  },
  "dell-xps-14-9440": {
    black: Array.from({ length: 5 }, (_, i) => `products/dell/dell-xps/dell-xps-14-9440/black/image-0${i + 1}.webp`),
  },

  // --- 2. DELL INSPIRON ---
  "dell-inspiron-14-5440": {
    black: Array.from({ length: 5 }, (_, i) => `products/dell/dell-inspiron/dell-inspiron-14-5440/black/image-0${i + 1}.webp`),
  },
  "dell-inspiron-16-5640": {
    black: Array.from({ length: 5 }, (_, i) => `products/dell/dell-inspiron/dell-inspiron-16-5640/black/image-0${i + 1}.webp`),
  },

  // --- 3. DELL LATITUDE ---
  "dell-latitude-3440": {
    black: Array.from({ length: 5 }, (_, i) => `products/dell/dell-latitude/dell-latitude-3440/black/image-0${i + 1}.webp`),
  },
  "dell-latitude-7440": {
    black: Array.from({ length: 5 }, (_, i) => `products/dell/dell-latitude/dell-latitude-7440/black/image-0${i + 1}.webp`),
  },

  // --- 4. DELL 15 ---
  "dell-vostro-15-3530": {
    black: Array.from({ length: 5 }, (_, i) => `products/dell/dell-15/dell-vostro-15-3530/black/image-0${i + 1}.webp`),
  },

  // --- 5. DELL 16 ---
  "dell-precision-16-5680": {
    black: Array.from({ length: 5 }, (_, i) => `products/dell/dell-16/dell-precision-16-5680/black/image-0${i + 1}.webp`),
  },

  // ===============================================================
  // 9. ASUS
  // ===============================================================

  // --- 1. ASUS ZENBOOK ---
  "asus-zenbook-14-oled-ux3405": {
    "ponder-blue": Array.from({ length: 5 }, (_, i) => `products/asus/asus-zenbook/asus-zenbook-14-oled-ux3405/ponder-blue/image-0${i + 1}.webp`),
  },
  "asus-zenbook-s-13-oled-ux5304": {
    "basalt-grey": Array.from({ length: 5 }, (_, i) => `products/asus/asus-zenbook/asus-zenbook-s-13-oled-ux5304/basalt-grey/image-0${i + 1}.webp`),
  },

  // --- 2. ASUS VIVOBOOK ---
  "asus-vivobook-15-x1504": {
    "quiet-blue": Array.from({ length: 5 }, (_, i) => `products/asus/asus-vivobook/asus-vivobook-15-x1504/quiet-blue/image-0${i + 1}.webp`),
  },
  "asus-vivobook-go-14-e1404": {
    "mixed-black": Array.from({ length: 5 }, (_, i) => `products/asus/asus-vivobook/asus-vivobook-go-14-e1404/mixed-black/image-0${i + 1}.webp`),
  },

  // --- 3. ASUS TUF GAMING ---
  "asus-tuf-gaming-a15-fa506": {
    "graphite-black": Array.from({ length: 5 }, (_, i) => `products/asus/asus-tuf/asus-tuf-gaming-a15-fa506/graphite-black/image-0${i + 1}.webp`),
  },
  "asus-tuf-gaming-f15-fx507": {
    "mecha-gray": Array.from({ length: 5 }, (_, i) => `products/asus/asus-tuf/asus-tuf-gaming-f15-fx507/mecha-gray/image-0${i + 1}.webp`),
  },

  // --- 4. ASUS ROG ---
  "asus-rog-strix-g16-g614": {
    "eclipse-gray": Array.from({ length: 5 }, (_, i) => `products/asus/asus-rog/asus-rog-strix-g16-g614/eclipse-gray/image-0${i + 1}.webp`),
  },
  "asus-rog-zephyrus-g14-ga403": {
    "platinum-white": Array.from({ length: 5 }, (_, i) => `products/asus/asus-rog/asus-rog-zephyrus-g14-ga403/platinum-white/image-0${i + 1}.webp`),
  },

  // --- 5. ASUS V16 GAMING ---
  "asus-v16-gaming-v161": {
    black: Array.from({ length: 5 }, (_, i) => `products/asus/asus-v16/asus-v16-gaming-v161/black/image-0${i + 1}.webp`),
  },

  // ===============================================================
  // 10. ACER
  // ===============================================================

  // --- ACER ---
  "acer-aspire-3-a315": {
    "pure-silver": Array.from({ length: 5 }, (_, i) => `products/acer/acer-aspire/acer-aspire-3-a315/pure-silver/image-0${i + 1}.webp`),
  },
  "acer-aspire-5-a515": {
    "steel-gray": Array.from({ length: 5 }, (_, i) => `products/acer/acer-aspire/acer-aspire-5-a515/steel-gray/image-0${i + 1}.webp`),
  },
  "acer-aspire-7-gaming-a715": {
    "charcoal-black": Array.from({ length: 5 }, (_, i) => `products/acer/acer-aspire-gaming/acer-aspire-7-gaming-a715/charcoal-black/image-0${i + 1}.webp`),
  },
  "acer-nitro-5-tiger-an515": {
    "obsidian-black": Array.from({ length: 5 }, (_, i) => `products/acer/acer-nitro/acer-nitro-5-tiger-an515/obsidian-black/image-0${i + 1}.webp`),
  },
  "acer-nitro-v-15-anv15": {
    "shale-black": Array.from({ length: 5 }, (_, i) => `products/acer/acer-nitro-v/acer-nitro-v-15-anv15/shale-black/image-0${i + 1}.webp`),
  },
  "acer-swift-go-14-sfg14": {
    "luxury-gold": Array.from({ length: 5 }, (_, i) => `products/acer/acer-swift/acer-swift-go-14-sfg14/luxury-gold/image-0${i + 1}.webp`),
  },
  "acer-predator-helios-neo-16-phn16": {
    "abyssal-black": Array.from({ length: 5 }, (_, i) => `products/acer/acer-predator/acer-predator-helios-neo-16-phn16/abyssal-black/image-0${i + 1}.webp`),
  },

  // ===============================================================
  // 11. HP
  // ===============================================================

  // --- HP ---
  "hp-15s-fq5111tu": {
    silver: Array.from({ length: 5 }, (_, i) => `products/hp/hp-15s/hp-15s-fq5111tu/silver/image-0${i + 1}.webp`),
  },
  "hp-probook-450-g10": {
    silver: Array.from({ length: 5 }, (_, i) => `products/hp/hp-probook/hp-probook-450-g10/silver/image-0${i + 1}.webp`),
  },
  "hp-envy-x360-14-fa0045au": {
    "atmospheric-blue": Array.from({ length: 5 }, (_, i) => `products/hp/hp-envy/hp-envy-x360-14-fa0045au/atmospheric-blue/image-0${i + 1}.webp`),
  },
  "hp-victus-15-fa1139tx": {
    "performance-blue": Array.from({ length: 5 }, (_, i) => `products/hp/hp-victus/hp-victus-15-fa1139tx/performance-blue/image-0${i + 1}.webp`),
  },
  "hp-omen-16-xf0071ax": {
    "shadow-black": Array.from({ length: 5 }, (_, i) => `products/hp/hp-omen/hp-omen-16-xf0071ax/shadow-black/image-0${i + 1}.webp`),
  },
  "hp-omnibook-x-14-fe0053au": {
    "meteor-silver": Array.from({ length: 5 }, (_, i) => `products/hp/hp-omnibook/hp-omnibook-x-14-fe0053au/meteor-silver/image-0${i + 1}.webp`),
  },
  "hp-omnibook-ultra-flip-14": {
    "eclipse-grey": Array.from({ length: 5 }, (_, i) => `products/hp/hp-omnibook/hp-omnibook-ultra-flip-14/eclipse-grey/image-0${i + 1}.webp`),
  },

  // ===============================================================
  // 12. TIVI
  // ===============================================================

  // --- TIVI ---
  "samsung-qled-4k-65q70c": {
    standard: Array.from({ length: 5 }, (_, i) => `products/tivi/qled/samsung-qled-4k-65q70c/standard/image-0${i + 1}.webp`),
  },
  "tcl-qled-4k-55c645": {
    standard: Array.from({ length: 5 }, (_, i) => `products/tivi/qled/tcl-qled-4k-55c645/standard/image-0${i + 1}.webp`),
  },
  "sony-4k-google-tv-55x75k": {
    standard: Array.from({ length: 5 }, (_, i) => `products/tivi/tivi-4k/sony-4k-google-tv-55x75k/standard/image-0${i + 1}.webp`),
  },
  "samsung-crystal-4k-50au7700": {
    standard: Array.from({ length: 5 }, (_, i) => `products/tivi/tivi-4k/samsung-crystal-4k-50au7700/standard/image-0${i + 1}.webp`),
  },
  "xiaomi-google-tv-a-pro-55": {
    standard: Array.from({ length: 5 }, (_, i) => `products/tivi/google-tv/xiaomi-google-tv-a-pro-55/standard/image-0${i + 1}.webp`),
  },
  "coocaa-google-tv-70y72": {
    standard: Array.from({ length: 5 }, (_, i) => `products/tivi/google-tv/coocaa-google-tv-70y72/standard/image-0${i + 1}.webp`),
  },

  // ===============================================================
  // 13. MÁY LẠNH
  // ===============================================================

  // --- MÁY LẠNH ---
  "daikin-1-chieu-atf25uv1v": {
    standard: Array.from({ length: 5 }, (_, i) => `products/may-lanh/1-chieu/daikin-1-chieu-atf25uv1v/standard/image-0${i + 1}.webp`),
  },
  "panasonic-1-chieu-n9zkh-8": {
    standard: Array.from({ length: 5 }, (_, i) => `products/may-lanh/1-chieu/panasonic-1-chieu-n9zkh-8/standard/image-0${i + 1}.webp`),
  },
  "daikin-2-chieu-inverter-f25vavmv": {
    standard: Array.from({ length: 5 }, (_, i) => `products/may-lanh/2-chieu/daikin-2-chieu-inverter-f25vavmv/standard/image-0${i + 1}.webp`),
  },
  "panasonic-2-chieu-inverter-yz9wkh-8": {
    standard: Array.from({ length: 5 }, (_, i) => `products/may-lanh/2-chieu/panasonic-2-chieu-inverter-yz9wkh-8/standard/image-0${i + 1}.webp`),
  },
  "samsung-inverter-ar10cyh": {
    standard: Array.from({ length: 5 }, (_, i) => `products/may-lanh/inverter/samsung-inverter-ar10cyh/standard/image-0${i + 1}.webp`),
  },
  "casper-inverter-tc-09is33": {
    standard: Array.from({ length: 5 }, (_, i) => `products/may-lanh/inverter/casper-inverter-tc-09is33/standard/image-0${i + 1}.webp`),
  },

  // ===============================================================
  // 14. TỦ LẠNH
  // ===============================================================

  // --- TỦ LẠNH ---
  "samsung-inverter-236l-rt22farbdsa": {
    silver: Array.from({ length: 5 }, (_, i) => `products/tu-lanh/inverter/samsung-236l/silver/image-0${i + 1}.webp`),
    black: Array.from({ length: 5 }, (_, i) => `products/tu-lanh/inverter/samsung-236l/black/image-0${i + 1}.webp`),
  },
  "panasonic-inverter-255l-nr-bv280qs": {
    silver: Array.from({ length: 5 }, (_, i) => `products/tu-lanh/inverter/panasonic-255l/silver/image-0${i + 1}.webp`),
  },
  "casper-multi-door-430l-rm-520vt": {
    "stainless-steel": Array.from({ length: 5 }, (_, i) => `products/tu-lanh/multi-door/casper-430l/stainless-steel/image-0${i + 1}.webp`),
  },
  "sharp-inverter-401l-sj-fx52gp-bk": {
    "black-glass": Array.from({ length: 5 }, (_, i) => `products/tu-lanh/multi-door/sharp-401l/black-glass/image-0${i + 1}.webp`),
  },
  "samsung-side-by-side-648l-rs64r5301b4": {
    "matte-black": Array.from({ length: 5 }, (_, i) => `products/tu-lanh/sbs/samsung-648l/matte-black/image-0${i + 1}.webp`),
  },
  "lg-side-by-side-635l-gr-d257js": {
    silver: Array.from({ length: 5 }, (_, i) => `products/tu-lanh/sbs/lg-635l/silver/image-0${i + 1}.webp`),
  },

  // --- MÁY GIẶT ---
  "lg-inverter-9kg-fv1409s4w": {
    white: Array.from({ length: 5 }, (_, i) => `products/may-giat/cua-truoc/lg-9kg/white/image-0${i + 1}.webp`),
    black: Array.from({ length: 5 }, (_, i) => `products/may-giat/cua-truoc/lg-9kg/black/image-0${i + 1}.webp`),
  },
  "samsung-ai-inverter-10kg-ww10tp44ds": {
    black: Array.from({ length: 5 }, (_, i) => `products/may-giat/cua-truoc/samsung-10kg/black/image-0${i + 1}.webp`),
  },
  "panasonic-inverter-8.5kg-na-fd85x1lrv": {
    black: Array.from({ length: 5 }, (_, i) => `products/may-giat/cua-tren/panasonic-8kg/black/image-0${i + 1}.webp`),
  },
  "toshiba-7kg-aw-k800av": {
    white: Array.from({ length: 5 }, (_, i) => `products/may-giat/cua-tren/toshiba-7kg/white/image-0${i + 1}.webp`),
  },
  "samsung-giat-say-14kg-wd14tp44dsx": {
    black: Array.from({ length: 5 }, (_, i) => `products/may-giat/giat-say/samsung-14kg/black/image-0${i + 1}.webp`),
  },

  // --- MÁY SẤY ---
  "electrolux-thong-hoi-8.5kg-eds854n3sb": {
    black: Array.from({ length: 5 }, (_, i) => `products/may-say/thong-hoi/electrolux-8kg/black/image-0${i + 1}.webp`),
    white: Array.from({ length: 5 }, (_, i) => `products/may-say/thong-hoi/electrolux-8kg/white/image-0${i + 1}.webp`),
  },
  "candy-ngung-tu-9kg-cso-c9te-s": {
    white: Array.from({ length: 5 }, (_, i) => `products/may-say/ngung-tu/candy-9kg/white/image-0${i + 1}.webp`),
  },
  "samsung-heatpump-9kg-dv90ta240ae": {
    white: Array.from({ length: 5 }, (_, i) => `products/may-say/heatpump/samsung-9kg/white/image-0${i + 1}.webp`),
  },
  "lg-heatpump-9kg-dvhp09b": {
    black: Array.from({ length: 5 }, (_, i) => `products/may-say/heatpump/lg-9kg/black/image-0${i + 1}.webp`),
  },

  // ===============================================================
  // 17. TỦ ĐÔNG
  // ===============================================================

  // --- TỦ ĐÔNG ---
  "sanaky-1-ngan-dong-100l-vh-1599hy": {
    white: Array.from({ length: 5 }, (_, i) => `products/tu-dong/1-ngan/sanaky-100l/white/image-0${i + 1}.webp`),
  },
  "sanaky-2-ngan-280l-vh-2899w3": {
    white: Array.from({ length: 5 }, (_, i) => `products/tu-dong/2-ngan/sanaky-280l/white/image-0${i + 1}.webp`),
  },
  "alaska-dung-210l-if-21": {
    white: Array.from({ length: 5 }, (_, i) => `products/tu-dong/tu-dung/alaska-210l/white/image-0${i + 1}.webp`),
  },

  // ================================================================
  // 18. TAI NGHE
  // ================================================================

  // --- ÂM THANH ---
  "apple-airpods-pro-2-usb-c": {
    white: Array.from({ length: 5 }, (_, i) => `products/audio/tai-nghe/apple-airpods-pro-2/white/image-0${i + 1}.webp`),
  },
  "sony-wh-1000xm5": {
    black: Array.from({ length: 5 }, (_, i) => `products/audio/tai-nghe/sony-wh-1000xm5/black/image-0${i + 1}.webp`),
    white: Array.from({ length: 5 }, (_, i) => `products/audio/tai-nghe/sony-wh-1000xm5/white/image-0${i + 1}.webp`),
  },
  "jbl-charge-5": {
    black: Array.from({ length: 5 }, (_, i) => `products/audio/loa/jbl-charge-5/black/image-0${i + 1}.webp`),
  },

  // --- GAMING GEAR ---
  "sony-playstation-5-slim": {
    white: Array.from({ length: 5 }, (_, i) => `products/gaming/console/ps5-slim/white/image-0${i + 1}.webp`),
  },
  "logitech-g-pro-x-superlight-2": {
    white: Array.from({ length: 5 }, (_, i) => `products/gaming/mouse/logitech-superlight/white/image-0${i + 1}.webp`),
    black: Array.from({ length: 5 }, (_, i) => `products/gaming/mouse/logitech-superlight/black/image-0${i + 1}.webp`),
  },
  "asus-rog-falchion-rx-low-profile": {
    white: Array.from({ length: 5 }, (_, i) => `products/gaming/keyboard/asus-rog/white/image-0${i + 1}.webp`),
  },

  // --- PHỤ KIỆN DI ĐỘNG ---
  "apple-adapter-usb-c-20w": {
    white: Array.from({ length: 5 }, (_, i) => `products/accessories/adapter/apple-20w/white/image-0${i + 1}.webp`),
  },
  "sac-du-phong-samsung-10000mah-25w": {
    black: Array.from({ length: 5 }, (_, i) => `products/accessories/powerbank/samsung-10k/black/image-0${i + 1}.webp`),
  },
  "apple-pencil-pro": {
    white: Array.from({ length: 5 }, (_, i) => `products/accessories/stylus/apple-pencil-pro/white/image-0${i + 1}.webp`),
  },

  // --- COMPUTER ACCESSORIES ---
  "chuot-logitech-mx-master-3s": {
    black: Array.from({ length: 5 }, (_, i) => `products/accessories/mouse/mx-master-3s/black/image-0${i + 1}.webp`),
    white: Array.from({ length: 5 }, (_, i) => `products/accessories/mouse/mx-master-3s/white/image-0${i + 1}.webp`),
  },
  "balo-laptop-targus-15.6-inch": {
    black: Array.from({ length: 5 }, (_, i) => `products/accessories/bag/targus-15/black/image-0${i + 1}.webp`),
  },
  "hub-chuyen-doi-anker-5-in-1-usb-c": {
    black: Array.from({ length: 5 }, (_, i) => `products/accessories/hub/anker-5in1/black/image-0${i + 1}.webp`),
  },

  // ================================================================
  // MÁY LẠNH / ĐIỀU HÒA
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
