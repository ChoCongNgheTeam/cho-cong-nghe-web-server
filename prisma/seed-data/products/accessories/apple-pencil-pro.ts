import { SeedProductInput } from "../types";

export const applePencilPro: SeedProductInput = {
  name: "Bút cảm ứng Apple Pencil Pro",
  slug: "apple-pencil-pro",
  description: `<h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Apple Pencil Pro – Sáng tạo không giới hạn</h2><p class="text-neutral-darker">Tích hợp cảm biến bóp (squeeze), xoay thân bút và phản hồi rung (haptic), mang lại trải nghiệm vẽ và ghi chú chân thực nhất.</p>`,
  brandName: "Apple",
  categoryNames: ["Bút cảm ứng"],
  isFeatured: true,
  variantDisplay: "CARD",
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
