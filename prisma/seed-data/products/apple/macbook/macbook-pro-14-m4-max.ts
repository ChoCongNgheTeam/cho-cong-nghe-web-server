import { SeedProductInput } from "../../types";

// MacBook Pro 14 M4 Max: 1 cấu hình (36GB/1TB)
export const macbookPro14M4Max: SeedProductInput = {
  name: "MacBook Pro 14 M4 Max 2024",
  slug: "macbook-pro-14-m4-max",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">MacBook Pro 14 M4 Max – Sức mạnh tối thượng trong 14 inch</h2>
    <p class="text-neutral-darker">
      Chip <strong class="font-semibold text-primary">M4 Max</strong> với 32 nhân GPU mang lại hiệu năng đồ họa đỉnh cao, xử lý video 8K và các tác vụ AI phức tạp không giới hạn. Đây là lựa chọn cho những ai muốn sức mạnh Mac Pro trong thân hình nhỏ gọn.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/mbp-14-m4-max.jpg" alt="MacBook Pro 14 M4 Max" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Hiệu năng GPU đỉnh cao trong thân hình 14 inch</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["MacBook Pro 14 inch"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "chip_m2" }, { key: "battery_life" }, { key: "no_fan_design" }],
};
