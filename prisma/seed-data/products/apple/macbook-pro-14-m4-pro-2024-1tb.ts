import { SeedProductInput } from "../types";

export const macbookPro14M4Pro_1TB: SeedProductInput = {
  name: "MacBook Pro 14 M4 Pro 2024 14CPU/20GPU/24GB/1TB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">MacBook Pro 14 M4 Pro – Cấu hình mạnh mẽ, lưu trữ cực lớn</h2>
    <p class="text-neutral-darker">
      Được trang bị chip <strong class="font-semibold text-primary">M4 Pro 14 nhân CPU</strong> và ổ cứng 1TB, chiếc máy này là lựa chọn tối ưu cho các lập trình viên và nhà làm phim. Khả năng kết nối đa dạng với Thunderbolt 5 mang lại tốc độ truyền tải dữ liệu nhanh chóng mặt.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/mbp-14-m4-pro-1tb.jpg" alt="MacBook Pro 14 M4 Pro 1TB" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Sẵn sàng cho mọi dự án phức tạp với bộ nhớ 1TB</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["MacBook Pro 14 inch"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
