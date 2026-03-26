import { SeedProductInput } from "../types";

export const marshallMajorV: SeedProductInput = {
  name: "Tai nghe Marshall Major V",
  slug: "marshall-major-v",
  description: `<h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Marshall Major V – Biểu tượng âm thanh Rock 'n' Roll</h2><p class="text-neutral-darker">Thời lượng pin ấn tượng lên đến hơn 100 giờ chơi nhạc không dây, thiết kế cổ điển bền bỉ và chất âm Marshall đặc trưng.</p>`,
  brandName: "Marshall",
  categoryNames: ["Tai nghe chụp tai"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "battery_capacity" }, { key: "bluetooth_version" }, { key: "water_resistance" }],
};
