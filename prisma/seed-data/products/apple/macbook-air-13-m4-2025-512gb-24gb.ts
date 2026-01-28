import { SeedProductInput } from "../types";

export const macbookAir13M4_512_24: SeedProductInput = {
  name: "Macbook Air 13 M4 2025 10CPU/10GPU/24GB/512GB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">
      MacBook Air 13 M4 – Cấu hình "khủng" với 24GB Unified Memory
    </h2>
    <p class="text-neutral-darker">
      Đây là phiên bản cao cấp nhất của dòng Air 13 inch với <strong class="font-semibold text-primary">24GB RAM</strong>, sẵn sàng cho các workflow chuyên nghiệp và chạy máy ảo. Sự kết hợp giữa chip M4 tối tân và bộ nhớ lớn giúp máy phá vỡ mọi giới hạn của một chiếc laptop mỏng nhẹ.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/macbook-air-m4-max.jpg" alt="MacBook Air M4 24GB" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Hiệu năng cực đỉnh trong thân hình siêu mỏng</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["MacBook Air 13 inch"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
