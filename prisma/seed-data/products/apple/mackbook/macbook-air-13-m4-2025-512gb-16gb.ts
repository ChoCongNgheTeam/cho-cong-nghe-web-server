import { SeedProductInput } from "../../types";

export const macbookAir13M4_512_16: SeedProductInput = {
  name: "Macbook Air 13 M4 2025 10CPU/10GPU/16GB/512GB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">
      MacBook Air 13 M4 – Đồ họa 10 nhân mạnh mẽ, lưu trữ thoải mái
    </h2>
    <p class="text-neutral-darker">
      Với cụm <strong class="font-semibold text-primary">10 nhân GPU</strong>, phiên bản MacBook Air M4 này xử lý tốt các tác vụ đồ họa, chỉnh sửa ảnh và video 4K. Dung lượng SSD 512GB mang lại không gian lưu trữ rộng rãi cho mọi tài liệu quan trọng và ứng dụng nặng.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/macbook-air-m4-gpu.jpg" alt="MacBook Air M4 GPU" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">GPU 10 nhân cho trải nghiệm đồ họa mượt mà</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["MacBook Air 13 inch"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
