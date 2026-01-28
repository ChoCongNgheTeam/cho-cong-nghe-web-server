import { SeedProductInput } from "../types";

export const macbookPro16M4Pro_24_512: SeedProductInput = {
  name: "MacBook Pro 16 M4 Pro 2024 14CPU/20GPU/24GB/512GB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">MacBook Pro 16 M4 Pro – Hiệu năng đỉnh cao trên màn hình lớn</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">MacBook Pro 16 inch</strong> với chip M4 Pro mang lại không gian làm việc rộng rãi và sức mạnh xử lý 14 nhân CPU vượt trội. Hệ thống âm thanh 6 loa chất lượng phòng thu cùng màn hình Liquid Retina XDR biến đây thành trạm làm việc di động hoàn hảo.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/mbp-16-m4-pro.jpg" alt="MacBook Pro 16 M4 Pro" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Màn hình 16 inch XDR rực rỡ cho mọi tác vụ đồ họa chuyên nghiệp</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["MacBook Pro 16 inch"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
