import { SeedProductInput } from "../types";

export const lenovoThinkBook14G6: SeedProductInput = {
  name: "Laptop Lenovo ThinkBook 14 G6 ABP",
  slug: "lenovo-thinkbook-14-g6-abp",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Lenovo ThinkBook 14 G6 – Hiện đại và bảo mật</h2>
    <p class="text-neutral-darker">
      Dành cho doanh nghiệp trẻ, <strong class="font-semibold text-primary">ThinkBook 14 G6</strong> kết hợp phong cách hiện đại với các tính năng bảo mật cấp doanh nghiệp, giúp bạn làm việc an toàn mọi nơi.
    </p>
  `,
  brandName: "Lenovo",
  categoryNames: ["Lenovo ThinkBook"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "laptop_cpu_version" }, { key: "laptop_ram_capacity" }, { key: "laptop_battery_life" }],
};
