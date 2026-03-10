// MacBook Pro 14 M5: 2 cấu hình (16GB/512GB, 24GB/512GB)

import { SeedProductInput } from "../../types";

// → RAM khác nhau → displayCard: true trong variantData
export const macbookPro14M5: SeedProductInput = {
  name: "MacBook Pro 14 M5 2025",
  slug: "macbook-pro-14-m5",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">MacBook Pro 14 M5 2025 – Thế hệ Pro mạnh mẽ nhất</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">MacBook Pro M5</strong> mang đến bước nhảy vọt về hiệu năng AI và khả năng tiết kiệm năng lượng vượt trội. Chip M5 kiến trúc mới giúp mọi tác vụ từ lập trình đến render đều diễn ra nhanh chóng hơn thế hệ trước.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/mbp-14-m5.jpg" alt="MacBook Pro 14 M5" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Chip M5 kiến trúc mới dẫn đầu thị trường</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["MacBook Pro 14 inch"],
  isFeatured: true,
  highlights: [{ key: "chip_m5" }, { key: "xdr_display" }, { key: "thunderbolt5" }],
};
