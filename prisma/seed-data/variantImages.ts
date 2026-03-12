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
