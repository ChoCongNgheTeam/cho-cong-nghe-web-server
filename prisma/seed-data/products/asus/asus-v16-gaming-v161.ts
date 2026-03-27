import { SeedProductInput } from "../types";

export const asusV16GamingV161: SeedProductInput = {
  name: "Asus V16 Gaming V161",
  slug: "asus-v16-gaming-v161",
  description: `<h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Asus V16 Gaming – Trải nghiệm màn hình lớn</h2><p class="text-neutral-darker">Tối ưu cho các công việc giải trí và văn phòng đa nhiệm với độ ổn định cao từ Asus.</p>`,
  brandName: "Asus",
  categoryNames: ["Asus ROG"],
  isFeatured: false,
  variantDisplay: "CARD", // Mặc định vào ROG hoặc TUF tùy theo phân khúc Gaming bạn muốn
  highlights: [{ key: "laptop_cpu_version" }, { key: "laptop_gpu_model" }, { key: "laptop_refresh_rate" }],
};
