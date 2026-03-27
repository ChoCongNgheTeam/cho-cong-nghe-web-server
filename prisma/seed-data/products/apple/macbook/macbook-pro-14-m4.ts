import { SeedProductInput } from "../../types";

// MacBook Pro 14 M4 Pro: 2 cấu hình (24GB/512GB 16core, 24GB/1TB 20core)
// → cùng RAM 24GB, khác storage + gpu → displayCard: false, dùng selector
export const macbookPro14M4: SeedProductInput = {
  name: "MacBook Pro 14 M4 2024",
  slug: "macbook-pro-14-m4",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">MacBook Pro 14 M4 Pro – Hiệu năng đồ họa chuyên nghiệp</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">MacBook Pro M4 Pro</strong> sở hữu sức mạnh vượt trội với 12 nhân CPU và 24GB RAM, xử lý mượt mà các luồng công việc nặng. Màn hình Liquid Retina XDR độ sáng cực cao kết hợp cùng Thunderbolt 5 cho tốc độ truyền tải nhanh chóng.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/mbp-14-m4-pro.jpg" alt="MacBook Pro 14 M4 Pro" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Đẳng cấp chuyên nghiệp với chip M4 Pro thế hệ mới</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["MacBook Pro 14 inch"],
  isFeatured: true,
  variantDisplay: "CARD",
  highlights: [{ key: "laptop_cpu_version" }, { key: "laptop_ram_capacity" }, { key: "laptop_gpu_model" }],
};
