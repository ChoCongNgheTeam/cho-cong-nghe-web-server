import { SeedProductInput } from "../types";

export const macbookAir15M4_512: SeedProductInput = {
  name: "Macbook Air 15 M4 2025 10CPU/10GPU/16GB/512GB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">MacBook Air 15 M4 2025 – Màn hình lớn, hiệu năng vô hạn</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">MacBook Air 15 M4</strong> kết hợp hoàn hảo giữa không gian hiển thị rộng rãi và sức mạnh từ chip M4 10 nhân GPU. Đây là lựa chọn tuyệt vời cho những ai cần diện tích làm việc lớn mà vẫn ưu tiên sự mỏng nhẹ và thời lượng pin bền bỉ cả ngày.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/mba-15-m4.jpg" alt="MacBook Air 15 M4" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Trải nghiệm hình ảnh sống động trên màn hình Liquid Retina 15 inch</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["MacBook Air 15 inch"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
