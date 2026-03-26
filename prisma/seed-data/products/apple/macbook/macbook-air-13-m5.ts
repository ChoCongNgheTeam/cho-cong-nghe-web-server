import { SeedProductInput } from "../../types";

export const macbookAir13M5: SeedProductInput = {
  name: "MacBook Air 13 M5 2025",
  slug: "macbook-air-13-m5",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">MacBook Air 13 M5 – Sức mạnh AI vượt giới hạn</h2>
    <p class="text-neutral-darker">
      Với chip <strong class="font-semibold text-primary">M5</strong> thế hệ mới, MacBook Air 13 inch không chỉ mỏng nhẹ mà còn sở hữu khả năng xử lý AI cực đỉnh. RAM tối thiểu từ 16GB giúp bạn xử lý mọi tác vụ từ học tập đến đồ họa bán chuyên một cách mượt mà.
    </p>
  `,
  brandName: "Apple",
  categoryNames: ["MacBook Air 13 inch"],
  isFeatured: true,
  variantDisplay: "CARD",
  highlights: [{ key: "laptop_cpu_version" }, { key: "laptop_ram_capacity" }, { key: "laptop_storage_capacity" }],
};
