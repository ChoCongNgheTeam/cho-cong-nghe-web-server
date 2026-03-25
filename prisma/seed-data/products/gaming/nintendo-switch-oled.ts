import { SeedProductInput } from "../types";

export const nintendoSwitchOled: SeedProductInput = {
  name: "Máy chơi game Nintendo Switch OLED Model",
  slug: "nintendo-switch-oled",
  description: `<h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Nintendo Switch OLED – Màu sắc rực rỡ, màn hình sống động</h2><p class="text-neutral-darker">Trang bị màn hình OLED 7 inch sắc nét, chân đứng rộng có thể điều chỉnh và bộ nhớ trong 64GB cho trải nghiệm chơi game linh hoạt.</p>`,
  brandName: "Nintendo",
  categoryNames: ["Thiết bị chơi game"],
  isFeatured: true,
  variantDisplay: "CARD",
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
