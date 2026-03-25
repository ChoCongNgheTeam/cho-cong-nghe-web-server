import { SeedProductInput } from "../types";

export const lenovoThinkBook16G6: SeedProductInput = {
  name: "Laptop Lenovo ThinkBook 16 G6 IRL",
  slug: "lenovo-thinkbook-16-g6-irl",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Lenovo ThinkBook 16 G6 – Màn hình lớn cho hiệu suất lớn</h2>
    <p class="text-neutral-darker">
      Với màn hình 16 inch rộng rãi, <strong class="font-semibold text-primary">ThinkBook 16 G6</strong> tối ưu không gian làm việc đa nhiệm và trình chiếu số liệu một cách rõ nét nhất.
    </p>
  `,
  brandName: "Lenovo",
  categoryNames: ["Lenovo ThinkBook"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "laptop_cpu_version" }, { key: "laptop_ram_capacity" }, { key: "laptop_battery_life" }],
};
