export const variantData: Record<
  string,
  Array<{
    storage: string;
    color: string;
    price: number;
    isDefault?: boolean;
  }>
> = {
  "iPhone 13": [
    { storage: "128gb", color: "white", price: 13490000, isDefault: true },
    { storage: "128gb", color: "black", price: 13490000 },
    { storage: "128gb", color: "red", price: 13490000 },
    { storage: "128gb", color: "pink", price: 13490000 },

    { storage: "256gb", color: "black", price: 15990000 },
    { storage: "256gb", color: "white", price: 15990000 },
    { storage: "256gb", color: "red", price: 15990000 },
    { storage: "256gb", color: "pink", price: 15990000 },
    { storage: "256gb", color: "alpine-green", price: 16490000 },

    { storage: "512gb", color: "black", price: 18990000 },
  ],

  "iPhone 14": [
    { storage: "128gb", color: "black", price: 16990000, isDefault: true },
    { storage: "256gb", color: "black", price: 19990000 },
    { storage: "512gb", color: "black", price: 22990000 },
  ],

  "Samsung Galaxy S24+": [
    { storage: "256gb", color: "black", price: 33990000, isDefault: true },
    { storage: "512gb", color: "gray", price: 38990000 },
  ],

  "Xiaomi 14 Ultra": [{ storage: "256gb", color: "black", price: 21990000, isDefault: true }],
};

export const variantImages: Record<string, Record<string, string[]>> = {
  "iPhone 13": {
    black: [
      "products/iphone-13/black/image-01.webp",
      "products/iphone-13/black/image-02.webp",
      "products/iphone-13/black/image-03.webp",
      "products/iphone-13/black/image-04.webp",
      "products/iphone-13/black/image-05.webp",
    ],
    white: [
      "products/iphone-13/white/image-01.webp",
      "products/iphone-13/white/image-02.webp",
      "products/iphone-13/white/image-03.webp",
      "products/iphone-13/white/image-04.webp",
      "products/iphone-13/white/image-05.webp",
    ],
    red: [
      "products/iphone-13/red/image-01.webp",
      "products/iphone-13/red/image-02.webp",
      "products/iphone-13/red/image-03.webp",
      "products/iphone-13/red/image-04.webp",
      "products/iphone-13/red/image-05.webp",
    ],
    pink: [
      "products/iphone-13/pink/image-01.webp",
      "products/iphone-13/pink/image-02.webp",
      "products/iphone-13/pink/image-03.webp",
      "products/iphone-13/pink/image-04.webp",
      "products/iphone-13/pink/image-05.webp",
    ],
    blue: [
      "products/iphone-13/blue/image-01.webp",
      "products/iphone-13/blue/image-02.webp",
      "products/iphone-13/blue/image-03.webp",
      "products/iphone-13/blue/image-04.webp",
      "products/iphone-13/blue/image-05.webp",
    ],
    "alpine-green": [
      "products/iphone-13/alpine-green/image-01.webp",
      "products/iphone-13/alpine-green/image-02.webp",
      "products/iphone-13/alpine-green/image-03.webp",
      "products/iphone-13/alpine-green/image-04.webp",
      "products/iphone-13/alpine-green/image-05.webp",
    ],
  },
};
