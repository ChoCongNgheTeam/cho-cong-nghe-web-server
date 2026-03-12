import { SeedProductInput } from "../../types";

export const macbookPro16M5Pro: SeedProductInput = {
  name: "MacBook Pro 16 M5 Pro 2025",
  slug: "macbook-pro-16-m5-Pro",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">MacBook Pro 16 M5 Max – Quái vật hiệu năng cho chuyên gia</h2>
    <p class="text-neutral-darker">
      Phiên bản <strong class="font-semibold text-primary">M5 Max</strong> trên dòng 16 inch là sự kết hợp hoàn hảo giữa tản nhiệt tối ưu và sức mạnh phần cứng khủng khiếp. Hỗ trợ lên đến 128GB RAM, đây là cỗ máy tối thượng cho lập trình viên AI và studio chuyên nghiệp.
    </p>
  `,
  brandName: "Apple",
  categoryNames: ["MacBook Pro 16 inch"],
  isFeatured: true,
  highlights: [{ key: "chip_m5_max" }, { key: "max_performance" }, { key: "pro_audio" }],
};
