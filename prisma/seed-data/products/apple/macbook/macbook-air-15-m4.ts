import { SeedProductInput } from "../../types";

// MacBook Air 15 M4: 2 cấu hình (16GB/256GB, 16GB/512GB)
// → cùng RAM 16GB, chỉ khác storage → displayCard: false, dùng selector
export const macbookAir15M4: SeedProductInput = {
  name: "MacBook Air 15 M4 2025",
  slug: "macbook-air-15-m4",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">MacBook Air 15 M4 – Tuyệt tác mỏng nhẹ thế hệ mới</h2>
    <p class="text-neutral-darker">
      Sở hữu chip <strong class="font-semibold text-primary">Apple M4</strong> mạnh mẽ trong một thân hình siêu mỏng, MacBook Air 15 inch mang lại hiệu suất vượt trội cho cả công việc và giải trí. Hệ thống âm thanh 6 loa với Spatial Audio mang đến trải nghiệm nghe nhìn rạp hát ngay tại nhà.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/mba-15-m4.jpg" alt="MacBook Air 15 M4" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Màn hình Liquid Retina 15 inch rực rỡ cho mọi tác vụ</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["MacBook Air 15 inch"],
  isFeatured: true,
  highlights: [{ key: "chip_m4" }, { key: "battery_life" }, { key: "six_speaker" }],
};
