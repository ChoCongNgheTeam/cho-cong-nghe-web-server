import { SeedProductInput } from "../types";

export const dellLatitude3440: SeedProductInput = {
  name: "Laptop Dell Latitude 3440",
  slug: "dell-latitude-3440",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Dell Latitude 3440 – Chuẩn mực doanh nghiệp</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Dell Latitude 3440</strong> cung cấp tính bảo mật và quản lý vượt trội cho môi trường doanh nghiệp hiện đại.
    </p>
  `,
  brandName: "Dell",
  categoryNames: ["Dell Latitude"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "laptop_cpu_version" }, { key: "laptop_ram_capacity" }, { key: "laptop_battery_life" }],
};
