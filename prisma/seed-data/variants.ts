export const variantData: Record<
  string,
  Array<{
    storage?: string;
    color?: string;
    price: number;
    isDefault?: boolean;
  }>
> = {
  "iphone-13": [
    { storage: "128gb", color: "white", price: 13490000, isDefault: true },
    { storage: "128gb", color: "orean", price: 13490000 },
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
    { storage: "256gb", color: "black", price: 19990000 },
    { storage: "512gb", color: "black", price: 22990000 },

    { storage: "128gb", color: "white", price: 16990000 },
    { storage: "256gb", color: "white", price: 19990000 },
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
    { storage: "128gb", color: "black", price: 39990000, isDefault: true },
    { storage: "256gb", color: "black", price: 42990000 },
    { storage: "512gb", color: "black", price: 45990000 },
  ],

  "iphone-17": [
    { storage: "128gb", color: "black", price: 46990000, isDefault: true },
    { storage: "256gb", color: "black", price: 49990000 },
    { storage: "512gb", color: "black", price: 52990000 },
  ],

  "iphone-17-pro": [
    { storage: "128gb", color: "black", price: 50990000, isDefault: true },
    { storage: "256gb", color: "black", price: 53990000 },
    { storage: "512gb", color: "black", price: 56990000 },
  ],

  "iphone-17-pro-max": [
    { storage: "128gb", color: "black", price: 53990000, isDefault: true },
    { storage: "256gb", color: "black", price: 56990000 },
    { storage: "512gb", color: "black", price: 59990000 },
  ],

  "samsung-galaxy-z-fold7-5g-12gb": [
    { storage: "256gb", color: "black", price: 40990000, isDefault: true },
    { storage: "512gb", color: "black", price: 44990000 },
  ],
  "samsung-galaxy-z-flip7-5g-12gb": [
    { storage: "256gb", color: "black", price: 25990000, isDefault: true },
  ],
  "samsung-galaxy-a56-5g-8gb": [
    { storage: "128gb", color: "black", price: 10990000, isDefault: true },
  ],
  "samsung-galaxy-a36-5g-8gb": [
    { storage: "128gb", color: "black", price: 8990000, isDefault: true },
  ],

  "samsung-galaxy-s25-ultra-5g-12gb": [
    { storage: "256gb", color: "black", price: 31990000, isDefault: true },
    { storage: "512gb", color: "black", price: 34990000 },
    { storage: "1tb", color: "black", price: 38990000 },
  ],

  "samsung-galaxy-s25-5g-12gb": [
    { storage: "256gb", color: "black", price: 21990000, isDefault: true },
    { storage: "512gb", color: "black", price: 24990000 },
  ],

  "samsung-galaxy-s25-plus-5g-12gb": [
    { storage: "256gb", color: "black", price: 25990000, isDefault: true },
    { storage: "512gb", color: "black", price: 28990000 },
  ],

  "samsung-galaxy-s25-fe-5g-8gb": [
    { storage: "128gb", color: "black", price: 14990000, isDefault: true },
    { storage: "256gb", color: "black", price: 16490000 },
  ],

  "samsung-galaxy-a26-5g-8gb": [
    { storage: "128gb", color: "black", price: 7490000, isDefault: true },
    { storage: "256gb", color: "black", price: 8490000 },
  ],

  "samsung-galaxy-z-fold6-5g": [
    { storage: "256gb", color: "black", price: 34990000, isDefault: true },
    { storage: "512gb", color: "black", price: 38490000 },
  ],

  "samsung-galaxy-s24-fe-5g": [
    { storage: "128gb", color: "black", price: 12990000, isDefault: true },
    { storage: "256gb", color: "black", price: 13990000 },
  ],

  "samsung-galaxy-s25-edge-5g": [
    { storage: "256gb", color: "black", price: 19990000, isDefault: true },
    { storage: "512gb", color: "black", price: 22990000 },
  ],

  "samsung-galaxy-s24-ultra-5g": [
    { storage: "256gb", color: "black", price: 23990000, isDefault: true },
    { storage: "512gb", color: "black", price: 26990000 },
  ],

  "oppo-reno15-5g-12gb": [
    { storage: "256gb", color: "black", price: 13990000, isDefault: true },
    { storage: "512gb", color: "black", price: 15490000 },
  ],

  "oppo-reno15-f-5g-8gb": [
    { storage: "128gb", color: "black", price: 10990000, isDefault: true },
    { storage: "256gb", color: "black", price: 12990000 },
  ],

  "oppo-reno14-5g-12gb": [
    { storage: "256gb", color: "black", price: 13990000, isDefault: true },
    { storage: "512gb", color: "black", price: 15490000 },
  ],

  "oppo-reno14-f-5g-8gb": [
    { storage: "128gb", color: "black", price: 10990000, isDefault: true },
    { storage: "256gb", color: "black", price: 12990000 },
  ],

  "oppo-reno13-f-5g-12gb": [
    { storage: "256gb", color: "black", price: 13990000, isDefault: true },
    { storage: "512gb", color: "black", price: 15490000 },
  ],

  "oppo-reno12-f-5g-8gb": [
    { storage: "128gb", color: "black", price: 10990000, isDefault: true },
    { storage: "256gb", color: "black", price: 12990000 },
  ],

  "oppo-reno11-f-5g-8gb": [
    { storage: "128gb", color: "black", price: 10990000, isDefault: true },
    { storage: "256gb", color: "black", price: 12990000 },
  ],

  "oppo-a6-pro-8gb": [
    { storage: "128gb", color: "black", price: 10990000, isDefault: true },
    { storage: "256gb", color: "black", price: 12990000 },
  ],

  "oppo-a5i-pro-8gb": [
    { storage: "128gb", color: "black", price: 10990000, isDefault: true },
    { storage: "256gb", color: "black", price: 12990000 },
  ],

  "oppo-a6t-6gb": [
    { storage: "128gb", color: "black", price: 10990000, isDefault: true },
    { storage: "256gb", color: "black", price: 12990000 },
  ],

  "oppo-a6t-4gb": [
    { storage: "128gb", color: "black", price: 10990000, isDefault: true },
    { storage: "256gb", color: "black", price: 12990000 },
  ],

  "oppo-a5i-6gb": [
    { storage: "128gb", color: "black", price: 10990000, isDefault: true },
    { storage: "256gb", color: "black", price: 12990000 },
  ],

  "oppo-a5i-4gb": [
    { storage: "128gb", color: "black", price: 10990000, isDefault: true },
    { storage: "256gb", color: "black", price: 12990000 },
  ],

  "oppo-a3-8gb": [
    { storage: "128gb", color: "black", price: 10990000, isDefault: true },
    { storage: "256gb", color: "black", price: 12990000 },
  ],

  "oppo-a3-6gb": [
    { storage: "128gb", color: "black", price: 10990000, isDefault: true },
    { storage: "256gb", color: "black", price: 12990000 },
  ],

  "oppo-a58-8gb": [
    { storage: "128gb", color: "black", price: 10990000, isDefault: true },
    { storage: "256gb", color: "black", price: 12990000 },
  ],

  "oppo-a58-6gb": [
    { storage: "128gb", color: "black", price: 10990000, isDefault: true },
    { storage: "256gb", color: "black", price: 12990000 },
  ],

  "oppo-a18-4gb": [
    { storage: "128gb", color: "black", price: 10990000, isDefault: true },
    { storage: "256gb", color: "black", price: 12990000 },
  ],

  "oppo-find-x9-pro-5g-16gb": [
    { storage: "256gb", color: "black", price: 13990000, isDefault: true },
    { storage: "512gb", color: "black", price: 15490000 },
  ],

  "oppo-find-x9-5g-16gb": [
    { storage: "256gb", color: "black", price: 13990000, isDefault: true },
    { storage: "512gb", color: "black", price: 15490000 },
  ],

  "oppo-find-x9-5g-12gb": [
    { storage: "256gb", color: "black", price: 13990000, isDefault: true },
    { storage: "512gb", color: "black", price: 15490000 },
  ],

  "oppo-find-n5-5g-16gb": [
    { storage: "256gb", color: "black", price: 13990000, isDefault: true },
    { storage: "512gb", color: "black", price: 15490000 },
  ],

  "oppo-find-n3-5g-16gb": [
    { storage: "256gb", color: "black", price: 13990000, isDefault: true },
    { storage: "512gb", color: "black", price: 15490000 },
  ],

  "xiaomi-poco-f8-pro-5g-12gb": [
    { storage: "256gb", color: "black", price: 13990000, isDefault: true },
    { storage: "512gb", color: "black", price: 15490000 },
  ],

  "xiaomi-poco-x7-5g-12gb": [
    { storage: "256gb", color: "black", price: 7990000, isDefault: true },
    { storage: "512gb", color: "black", price: 8990000 },
  ],

  "xiaomi-poco-m7-pro-5g-8gb": [
    { storage: "128gb", color: "black", price: 5490000, isDefault: true },
    { storage: "256gb", color: "black", price: 6290000 },
  ],

  "xiaomi-poco-m6-pro-8gb": [
    { storage: "128gb", color: "black", price: 4490000, isDefault: true },
    { storage: "256gb", color: "black", price: 4990000 },
  ],

  "xiaomi-poco-c71-4gb": [{ storage: "128gb", color: "black", price: 2990000, isDefault: true }],

  "xiaomi-redmi-note-15-pro-5g-12gb": [
    { storage: "256gb", color: "black", price: 9990000, isDefault: true },
    { storage: "512gb", color: "black", price: 11490000 },
  ],

  "xiaomi-redmi-note-15-5g-6gb": [
    { storage: "128gb", color: "black", price: 6490000, isDefault: true },
  ],

  "xiaomi-redmi-note-15-6gb": [
    { storage: "128gb", color: "black", price: 5490000, isDefault: true },
  ],

  "xiaomi-redmi-note-14-pro-plus-5g-8gb": [
    { storage: "256gb", color: "black", price: 7990000, isDefault: true },
  ],

  "xiaomi-redmi-note-14-5g-8gb": [
    { storage: "128gb", color: "black", price: 4990000, isDefault: true },
  ],

  "xiaomi-redmi-note-14-6gb": [
    { storage: "128gb", color: "black", price: 3990000, isDefault: true },
  ],

  "xiaomi-redmi-15-5g-8gb": [
    { storage: "128gb", color: "black", price: 5990000, isDefault: true },
    { storage: "256gb", color: "black", price: 6790000 },
  ],

  "xiaomi-redmi-14c-4gb": [{ storage: "128gb", color: "black", price: 2890000, isDefault: true }],

  "xiaomi-redmi-13x-8gb": [{ storage: "128gb", color: "black", price: 3490000, isDefault: true }],

  "macbook-air-13-m4-2025-10cpu-8gpu-16gb-256gb": [
    { storage: "256gb", color: "black", price: 15990000, isDefault: true },
  ],

  "macbook-air-13-m2-2024-8cpu-8gpu-16gb-256gb": [
    { storage: "256gb", color: "black", price: 15990000, isDefault: true },
  ],

  "macbook-air-13-m4-2025-10cpu-10gpu-16gb-512gb": [
    { storage: "512gb", color: "black", price: 18990000, isDefault: true },
  ],
  "macbook-air-13-m4-2025-10cpu-10gpu-24gb-512gb": [
    { storage: "512gb", color: "black", price: 20990000, isDefault: true },
  ],

  "macbook-air-15-m4-2025-10cpu-10gpu-16gb-512gb": [
    { storage: "512gb", color: "black", price: 21990000, isDefault: true },
  ],

  "macbook-air-15-m4-2025-10cpu-10gpu-16gb-256gb": [
    { storage: "256gb", color: "black", price: 19990000, isDefault: true },
  ],

  "macbook-air-15-inch-m2-2023-8cpu-10gpu-8gb-512gb-sac-70w": [
    { storage: "512gb", color: "black", price: 21990000, isDefault: true },
  ],
  "macbook-pro-14-m4-pro-2024-12cpu-16gpu-24gb-512gb": [
    { storage: "512gb", color: "black", price: 23990000, isDefault: true },
  ],
  "macbook-pro-14-m4-pro-2024-14grpu-20gpu-24gb-1tb": [
    { storage: "1tb", color: "black", price: 25990000, isDefault: true },
  ],

  "macbook-pro-14-2023-m3-pro-12-cpu-18-gpu-18gb-1tb": [
    { storage: "1tb", color: "black", price: 27990000, isDefault: true },
  ],
  "macbook-pro-14-m4-max-2024-14cpu-32gpu-36gb-1tb": [
    { storage: "1tb", color: "black", price: 29990000, isDefault: true },
  ],
  "macbook-pro-14-m5-2025-10cpu-10gpu-16gb-512gb": [
    { storage: "512gb", color: "black", price: 31990000, isDefault: true },
  ],
  "macbook-pro-14-m5-2025-10cpu-10gpu-24gb-512gb": [
    { storage: "512gb", color: "black", price: 33990000, isDefault: true },
  ],
  "macbook-pro-16-m4-pro-2024-14cpu-20gpu-24gb-512gb": [
    { storage: "512gb", color: "black", price: 35990000, isDefault: true },
  ],
  "macbook-pro-16-m4-pro-2024-14cpu-20gpu-48gb-512gb": [
    { storage: "512gb", color: "black", price: 37990000, isDefault: true },
  ],
  "macbook-pro-16-m4-max-2024-14cpu-32gpu-36gb-1tb": [
    { storage: "1tb", color: "black", price: 39990000, isDefault: true },
  ],
  "macbook-pro-16-m4-max-2024-16cpu-40gpu-48gb-1tb": [
    { storage: "1tb", color: "black", price: 41990000, isDefault: true },
  ],

  "comfee-inverter-1-5-hp-cfs-13vgp": [{ color: "black", price: 20990000, isDefault: true }],

  "casper-inverter-1-5-hp-gc-12ib36": [{ color: "black", price: 21990000, isDefault: true }],

  "casper-inverter-1-hp-tc-09is35": [{ color: "black", price: 22990000, isDefault: true }],

  "casper-inverter-1-5-hp-gc-12is35": [{ color: "black", price: 23990000, isDefault: true }],

  "tai-nghe-co-day-apple-earpods-usb-c-2023-myqy3za-a": [
    { color: "black", price: 24990000, isDefault: true },
  ],

  "tai-nghe-co-day-apple-earpods-lightning-mwty3za-a": [
    { color: "black", price: 25990000, isDefault: true },
  ],

  "tai-nghe-co-day-apple-earpods-lightning-mmtn2za-a": [
    { color: "black", price: 26990000, isDefault: true },
  ],

  "tai-nghe-apple-airpods-pro-3-2025-usb-c": [{ color: "black", price: 27990000, isDefault: true }],
};

export const variantImages: Record<string, Record<string, string[]>> = {
  "iphone-13": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/iphone/iphone-13/black/image-0${i + 1}.webp`,
    ),
    white: Array.from(
      { length: 5 },
      (_, i) => `products/iphone/iphone-13/white/image-0${i + 1}.webp`,
    ),
    red: Array.from({ length: 5 }, (_, i) => `products/iphone/iphone-13/red/image-0${i + 1}.webp`),
    pink: Array.from(
      { length: 5 },
      (_, i) => `products/iphone/iphone-13/pink/image-0${i + 1}.webp`,
    ),
    blue: Array.from(
      { length: 5 },
      (_, i) => `products/iphone/iphone-13/blue/image-0${i + 1}.webp`,
    ),
    "alpine-green": Array.from(
      { length: 5 },
      (_, i) => `products/iphone/iphone-13/alpine-green/image-0${i + 1}.webp`,
    ),
  },

  "iphone-14": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/iphone/iphone-14/black/image-0${i + 1}.webp`,
    ),
  },

  "iphone-15": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/iphone/iphone-15/black/image-0${i + 1}.webp`,
    ),
  },

  "iphone-16": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/iphone/iphone-16/black/image-0${i + 1}.webp`,
    ),
  },

  "iphone-16-plus": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/iphone/iphone-16-plus/black/image-0${i + 1}.webp`,
    ),
  },

  "iphone-16-pro-max": {
    "titan-black": Array.from(
      { length: 5 },
      (_, i) => `products/iphone/iphone-16-pro-max/titan-black/image-0${i + 1}.webp`,
    ),
  },

  "iphone-17": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/iphone/iphone-17/black/image-0${i + 1}.webp`,
    ),
  },

  "iphone-17-pro": {
    silver: Array.from(
      { length: 5 },
      (_, i) => `products/iphone/iphone-17-pro/silver/image-0${i + 1}.webp`,
    ),
  },

  "iphone-17-pro-max": {
    orange: Array.from(
      { length: 5 },
      (_, i) => `products/iphone/iphone-17-pro-max/orange/image-0${i + 1}.webp`,
    ),
  },

  "macbook-air-13-m4-2025-10cpu-8gpu-16gb-256gb": {
    black: Array.from(
      { length: 5 },
      (_, i) =>
        `products/macbook/macbook-air-13-m4-2025-10cpu-8gpu-16gb/black/image-0${i + 1}.webp`,
    ),
  },

  "macbook-air-13-m2-2024-8cpu-8gpu-16gb-256gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/macbook/macbook-air-13-m2-2024-8cpu-8gpu-16gb/black/image-0${i + 1}.webp`,
    ),
  },

  "macbook-air-13-m4-2025-10cpu-10gpu-16gb-512gb": {
    black: Array.from(
      { length: 5 },
      (_, i) =>
        `products/macbook/macbook-air-13-m4-2025-10cpu-10gpu-16gb/black/image-0${i + 1}.webp`,
    ),
  },

  "macbook-air-13-m4-2025-10cpu-10gpu-24gb-512gb": {
    black: Array.from(
      { length: 5 },
      (_, i) =>
        `products/macbook/macbook-air-13-m4-2025-10cpu-10gpu-24gb/black/image-0${i + 1}.webp`,
    ),
  },

  "macbook-air-15-m4-2025-10cpu-10gpu-16gb-512gb": {
    black: Array.from(
      { length: 5 },
      (_, i) =>
        `products/macbook/macbook-air-15-m4-2025-10cpu-10gpu-16gb/black/image-0${i + 1}.webp`,
    ),
  },

  "macbook-air-15-m4-2025-10cpu-10gpu-16gb-256gb": {
    black: Array.from(
      { length: 5 },
      (_, i) =>
        `products/macbook/macbook-air-15-m4-2025-10cpu-10gpu-16gb/black/image-0${i + 1}.webp`,
    ),
  },

  "macbook-air-15-inch-m2-2023-8cpu-10gpu-8gb-512gb-sac-70w": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/macbook/macbook-air-15-m2-2023-8cpu-10gpu-8gb/black/image-0${i + 1}.webp`,
    ),
  },

  "macbook-pro-14-m4-pro-2024-12cpu-16gpu-24gb-512gb": {
    black: Array.from(
      { length: 5 },
      (_, i) =>
        `products/macbook/macbook-pro-14-m4-pro-2024-12cpu-16gpu-24gb/black/image-0${i + 1}.webp`,
    ),
  },

  "macbook-pro-14-m4-pro-2024-14cpu-20gpu-24gb-1tb": {
    black: Array.from(
      { length: 5 },
      (_, i) =>
        `products/macbook/macbook-pro-14-m4-pro-2024-14cpu-20gpu-24gb/black/image-0${i + 1}.webp`,
    ),
  },

  "macbook-pro-14-2023-m3-pro-12-cpu-18-gpu-18gb-1tb": {
    black: Array.from(
      { length: 5 },
      (_, i) =>
        `products/macbook/macbook-pro-14-m3-pro-2023-12cpu-18gpu-18gb/black/image-0${i + 1}.webp`,
    ),
  },

  "macbook-pro-14-m4-max-2024-14cpu-32gpu-36gb-1tb": {
    black: Array.from(
      { length: 5 },
      (_, i) =>
        `products/macbook/macbook-pro-14-m4-max-2024-14cpu-32gpu-36gb/black/image-0${i + 1}.webp`,
    ),
  },

  "macbook-pro-14-m5-2025-10cpu-10gpu-16gb-512gb": {
    black: Array.from(
      { length: 5 },
      (_, i) =>
        `products/macbook/macbook-pro-14-m5-2025-10cpu-10gpu-16gb/black/image-0${i + 1}.webp`,
    ),
  },

  "macbook-pro-14-m5-2025-10cpu-10gpu-24gb-512gb": {
    black: Array.from(
      { length: 5 },
      (_, i) =>
        `products/macbook/macbook-pro-14-m5-2025-10cpu-10gpu-24gb/black/image-0${i + 1}.webp`,
    ),
  },

  "macbook-pro-16-m4-pro-2024-14cpu-20gpu-24gb-512gb": {
    black: Array.from(
      { length: 5 },
      (_, i) =>
        `products/macbook/macbook-pro-16-m4-pro-2024-14cpu-20gpu-24gb/black/image-0${i + 1}.webp`,
    ),
  },

  "macbook-pro-16-m4-pro-2024-14cpu-20gpu-48gb-512gb": {
    black: Array.from(
      { length: 5 },
      (_, i) =>
        `products/macbook/macbook-pro-16-m4-pro-2024-14cpu-20gpu-48gb/black/image-0${i + 1}.webp`,
    ),
  },

  "macbook-pro-16-m4-max-2024-14cpu-32gpu-36gb-1tb": {
    black: Array.from(
      { length: 5 },
      (_, i) =>
        `products/macbook/macbook-pro-16-m4-max-2024-14cpu-32gpu-36gb/black/image-0${i + 1}.webp`,
    ),
  },

  "macbook-pro-16-m4-max-2024-16cpu-40gpu-48gb-1tb": {
    black: Array.from(
      { length: 5 },
      (_, i) =>
        `products/macbook/macbook-pro-16-m4-max-2024-16cpu-40gpu-48gb/black/image-0${i + 1}.webp`,
    ),
  },

  "samsung-galaxy-z-fold7-5g-12gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/samsung/samsung-galaxy-z-fold7-5g-12gb/black/image-0${i + 1}.webp`,
    ),
  },
  "samsung-galaxy-z-flip7-5g-12gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/samsung/samsung-galaxy-z-flip7-5g-12gb/black/image-0${i + 1}.webp`,
    ),
  },
  "samsung-galaxy-a56-5g-8gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/samsung/samsung-galaxy-a56-5g-8gb/black/image-0${i + 1}.webp`,
    ),
  },
  "samsung-galaxy-a36-5g-8gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/samsung/samsung-galaxy-a36-5g-8gb/black/image-0${i + 1}.webp`,
    ),
  },
  "samsung-galaxy-s25-ultra-5g-12gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/samsung/samsung-galaxy-s25-ultra-5g-12gb/black/image-0${i + 1}.webp`,
    ),
  },
  "samsung-galaxy-s25-5g-12gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/samsung/samsung-galaxy-s25-5g-12gb/black/image-0${i + 1}.webp`,
    ),
  },
  "samsung-galaxy-s25-plus-5g-12gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/samsung/samsung-galaxy-s25-plus-5g-12gb/black/image-0${i + 1}.webp`,
    ),
  },
  "samsung-galaxy-s25-fe-5g-8gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/samsung/samsung-galaxy-s25-fe-5g-8gb/black/image-0${i + 1}.webp`,
    ),
  },
  "samsung-galaxy-a26-5g-8gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/samsung/samsung-galaxy-a26-5g-8gb/black/image-0${i + 1}.webp`,
    ),
  },
  "samsung-galaxy-z-fold6-5g": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/samsung/samsung-galaxy-z-fold6-5g/black/image-0${i + 1}.webp`,
    ),
  },
  "samsung-galaxy-s24-fe-5g": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/samsung/samsung-galaxy-s24-fe-5g/black/image-0${i + 1}.webp`,
    ),
  },
  "samsung-galaxy-s25-edge-5g": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/samsung/samsung-galaxy-s25-edge-5g/black/image-0${i + 1}.webp`,
    ),
  },
  "samsung-galaxy-s24-ultra-5g": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/samsung/samsung-galaxy-s24-ultra-5g/black/image-0${i + 1}.webp`,
    ),
  },
  "oppo-reno15-5g-12gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/oppo/oppo-reno15-5g-12gb/black/image-0${i + 1}.webp`,
    ),
  },
  "oppo-reno15-f-5g-8gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/oppo/oppo-reno15-f-5g-8gb/black/image-0${i + 1}.webp`,
    ),
  },
  "oppo-reno14-5g-12gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/oppo/oppo-reno14-5g-12gb/black/image-0${i + 1}.webp`,
    ),
  },
  "oppo-reno14-f-5g-8gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/oppo/oppo-reno14-f-5g-8gb/black/image-0${i + 1}.webp`,
    ),
  },
  "oppo-reno13-f-5g-12gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/oppo/oppo-reno13-f-5g-12gb/black/image-0${i + 1}.webp`,
    ),
  },
  "oppo-reno12-f-5g-8gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/oppo/oppo-reno12-f-5g-8gb/black/image-0${i + 1}.webp`,
    ),
  },
  "oppo-reno11-f-5g-8gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/oppo/oppo-reno11-f-5g-8gb/black/image-0${i + 1}.webp`,
    ),
  },
  "oppo-a6-pro-8gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/oppo/oppo-a6-pro-8gb/black/image-0${i + 1}.webp`,
    ),
  },
  "oppo-a5i-pro-8gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/oppo/oppo-a5i-pro-8gb/black/image-0${i + 1}.webp`,
    ),
  },
  "oppo-a6t-6gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/oppo/oppo-a6t-6gb/black/image-0${i + 1}.webp`,
    ),
  },
  "oppo-a6t-4gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/oppo/oppo-a6t-4gb/black/image-0${i + 1}.webp`,
    ),
  },
  "oppo-a5i-6gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/oppo/oppo-a5i-6gb/black/image-0${i + 1}.webp`,
    ),
  },
  "oppo-a5i-4gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/oppo/oppo-a5i-4gb/black/image-0${i + 1}.webp`,
    ),
  },
  "oppo-a3-8gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/oppo/oppo-a3-8gb/black/image-0${i + 1}.webp`,
    ),
  },
  "oppo-a3-6gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/oppo/oppo-a3-6gb/black/image-0${i + 1}.webp`,
    ),
  },
  "oppo-a58-8gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/oppo/oppo-a58-8gb/black/image-0${i + 1}.webp`,
    ),
  },
  "oppo-a58-6gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/oppo/oppo-a58-6gb/black/image-0${i + 1}.webp`,
    ),
  },
  "oppo-a18-4gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/oppo/oppo-a18-4gb/black/image-0${i + 1}.webp`,
    ),
  },
  "oppo-find-x9-pro-5g-16gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/oppo/oppo-find-x9-pro-5g-16gb/black/image-0${i + 1}.webp`,
    ),
  },
  "oppo-find-x9-5g-16gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/oppo/oppo-find-x9-5g-16gb/black/image-0${i + 1}.webp`,
    ),
  },
  "oppo-find-x9-5g-12gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/oppo/oppo-find-x9-5g-12gb/black/image-0${i + 1}.webp`,
    ),
  },
  "oppo-find-n5-5g-16gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/oppo/oppo-find-n5-5g-16gb/black/image-0${i + 1}.webp`,
    ),
  },
  "oppo-find-n3-5g-16gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/oppo/oppo-find-n3-5g-16gb/black/image-0${i + 1}.webp`,
    ),
  },
  "xiaomi-poco-f8-pro-5g-12gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/xiaomi/xiaomi-poco-f8-pro-5g-12gb/black/image-0${i + 1}.webp`,
    ),
  },
  "xiaomi-poco-x7-5g-12gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/xiaomi/xiaomi-poco-x7-5g-12gb/black/image-0${i + 1}.webp`,
    ),
  },
  "xiaomi-poco-m7-pro-5g-8gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/xiaomi/xiaomi-poco-m7-pro-5g-8gb/black/image-0${i + 1}.webp`,
    ),
  },
  "xiaomi-poco-m6-pro-8gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/xiaomi/xiaomi-poco-m6-pro-8gb/black/image-0${i + 1}.webp`,
    ),
  },
  "xiaomi-poco-c71-4gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/xiaomi/xiaomi-poco-c71-4gb/black/image-0${i + 1}.webp`,
    ),
  },
  "xiaomi-redmi-note-15-pro-5g-12gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/xiaomi/xiaomi-redmi-note-15-pro-5g-12gb/black/image-0${i + 1}.webp`,
    ),
  },
  "xiaomi-redmi-note-15-5g-6gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/xiaomi/xiaomi-redmi-note-15-5g-6gb/black/image-0${i + 1}.webp`,
    ),
  },
  "xiaomi-redmi-note-15-6gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/xiaomi/xiaomi-redmi-note-15-6gb/black/image-0${i + 1}.webp`,
    ),
  },
  "xiaomi-redmi-note-14-pro-plus-5g-8gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/xiaomi/xiaomi-redmi-note-14-pro-plus-5g-8gb/black/image-0${i + 1}.webp`,
    ),
  },
  "xiaomi-redmi-note-14-5g-8gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/xiaomi/xiaomi-redmi-note-14-5g-8gb/black/image-0${i + 1}.webp`,
    ),
  },
  "xiaomi-redmi-note-14-6gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/xiaomi/xiaomi-redmi-note-14-6gb/black/image-0${i + 1}.webp`,
    ),
  },
  "xiaomi-redmi-15-5g-8gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/xiaomi/xiaomi-redmi-15-5g-8gb/black/image-0${i + 1}.webp`,
    ),
  },
  "xiaomi-redmi-14c-4gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/xiaomi/xiaomi-redmi-14c-4gb/black/image-0${i + 1}.webp`,
    ),
  },
  "xiaomi-redmi-13x-8gb": {
    black: Array.from(
      { length: 5 },
      (_, i) => `products/xiaomi/xiaomi-redmi-13x-8gb/black/image-0${i + 1}.webp`,
    ),
  },
  "comfee-inverter-1-5-hp-cfs-13vgp": {
    black: Array.from(
      { length: 5 },
      (_, i) =>
        `products/air-conditioner/comfee-inverter-1-5-hp-cfs-13vgp/black/image-0${i + 1}.webp`,
    ),
  },
  "casper-inverter-1-5-hp-gc-12ib36": {
    black: Array.from(
      { length: 5 },
      (_, i) =>
        `products/air-conditioner/casper-inverter-1-5-hp-gc-12ib36/black/image-0${i + 1}.webp`,
    ),
  },
  "casper-inverter-1-hp-tc-09is35": {
    black: Array.from(
      { length: 5 },
      (_, i) =>
        `products/air-conditioner/casper-inverter-1-hp-tc-09is35/black/image-0${i + 1}.webp`,
    ),
  },
  "casper-inverter-1-5-hp-gc-12is35": {
    black: Array.from(
      { length: 5 },
      (_, i) =>
        `products/air-conditioner/casper-inverter-1-5-hp-gc-12is35/black/image-0${i + 1}.webp`,
    ),
  },
  "tai-nghe-co-day-apple-earpods-usb-c-2023-myqy3za-a": {
    black: Array.from(
      { length: 5 },
      (_, i) =>
        `products/headphones/tai-nghe-apple-earpods-usb-c-2023-myqy3za-a/black/image-0${i + 1}.webp`,
    ),
  },
  "tai-nghe-co-day-apple-earpods-lightning-mwty3za-a": {
    black: Array.from(
      { length: 5 },
      (_, i) =>
        `products/headphones/tai-nghe-apple-earpods-lightning-mwty3za-a/black/image-0${i + 1}.webp`,
    ),
  },
  "tai-nghe-co-day-apple-earpods-lightning-mmtn2za-a": {
    black: Array.from(
      { length: 5 },
      (_, i) =>
        `products/headphones/tai-nghe-apple-earpods-lightning-mmtn2za-a/black/image-0${i + 1}.webp`,
    ),
  },
  "tai-nghe-apple-airpods-pro-3-2025-usb-c": {
    black: Array.from(
      { length: 5 },
      (_, i) =>
        `products/headphones/tai-nghe-apple-airpods-pro-3-2025-usb-c/black/image-0${i + 1}.webp`,
    ),
  },
};
