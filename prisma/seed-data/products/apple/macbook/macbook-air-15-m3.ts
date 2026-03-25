import { SeedProductInput } from "../../types";

export const macbookAir15M3: SeedProductInput = {
  name: "MacBook Air 15 M3 2024",
  slug: "macbook-air-15-m3",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">MacBook Air 15 M3 – Màn hình lớn, trải nghiệm rộng mở</h2>
    <p class="text-neutral-darker">
      Tận hưởng không gian làm việc bao la trên <strong class="font-semibold text-primary">MacBook Air 15 inch M3</strong>. Với thiết kế siêu mỏng và khả năng xuất 2 màn hình ngoài khi gập máy, đây là chiếc laptop 15 inch tốt nhất thế giới cho người hay di chuyển.
    </p>
  `,
  brandName: "Apple",
  categoryNames: ["MacBook Air 15 inch"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "laptop_cpu_version" }, { key: "laptop_ram_capacity" }, { key: "laptop_storage_capacity" }],
};
