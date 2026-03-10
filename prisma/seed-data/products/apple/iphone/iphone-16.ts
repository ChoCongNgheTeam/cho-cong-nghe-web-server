import { SeedProductInput } from "../../types";

export const iphone16: SeedProductInput = {
  name: "iPhone 16",
  slug: "iphone-16",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">
      iPhone 16 – Sáng tạo không giới hạn với Nút Điều Khiển Camera
    </h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">iPhone 16</strong> sở hữu chip A18 cực mạnh và nút Điều Khiển Camera (Camera Control) giúp truy cập nhanh các tính năng nhiếp ảnh. Thiết kế camera dọc mới hỗ trợ quay phim không gian, kết hợp cùng thời lượng pin bền bỉ và nút Tác Vụ linh hoạt.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/iphone-16.jpg" alt="iPhone 16" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">iPhone 16 với nút Camera Control hoàn toàn mới</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["iPhone 16 Series"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
