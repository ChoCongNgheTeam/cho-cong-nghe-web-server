// MacBook Pro 16 M4 Max: 2 cấu hình (36GB/1TB, 48GB/1TB)

import { SeedProductInput } from "../../types";

// → RAM khác nhau → displayCard: true trong variantData
export const macbookPro16M4Max: SeedProductInput = {
  name: "MacBook Pro 16 M4 Max 2024",
  slug: "macbook-pro-16-m4-max",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">MacBook Pro 16 M4 Max – Sức mạnh tối thượng cho sáng tạo chuyên nghiệp</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">MacBook Pro M4 Max</strong> là đỉnh cao với tối đa 40 nhân GPU và 48GB RAM, sẵn sàng chinh phục mọi dự án 3D và video 8K. Đây là trạm làm việc di động mạnh nhất từ Apple dành cho các nhà sáng tạo nội dung chuyên nghiệp.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/mbp-16-m4-max.jpg" alt="MacBook Pro 16 M4 Max" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Đỉnh cao công nghệ Apple Silicon với 40 nhân GPU</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["MacBook Pro 16 inch"],
  isFeatured: true,
  highlights: [{ key: "chip_m4_max" }, { key: "xdr_display" }, { key: "six_speaker" }],
};
