import { SeedProductInput } from "../../types";

export const macbookPro14M4Pro_512: SeedProductInput = {
  name: "MacBook Pro 14 M4 Pro 2024 12CPU/16GPU/24GB/512GB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">MacBook Pro 14 M4 Pro – Hiệu năng đồ họa chuyên nghiệp</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">MacBook Pro M4 Pro</strong> sở hữu sức mạnh vượt trội với 12 nhân CPU và 24GB RAM, xử lý mượt mà các luồng công việc nặng. Màn hình Liquid Retina XDR độ sáng cực cao kết hợp cùng hệ thống tản nhiệt tiên tiến giúp duy trì hiệu năng đỉnh cao liên tục.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/mbp-14-m4-pro.jpg" alt="MacBook Pro 14 M4 Pro" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Đẳng cấp chuyên nghiệp với chip M4 Pro thế hệ mới</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["MacBook Pro 14 inch"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
