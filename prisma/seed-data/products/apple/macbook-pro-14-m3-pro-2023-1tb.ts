import { SeedProductInput } from "../types";

export const macbookPro14M3Pro_1TB: SeedProductInput = {
  name: "MacBook Pro 14 2023 M3 Pro 12 CPU/18 GPU/18GB/1TB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">MacBook Pro 14 M3 Pro – Hiệu năng ổn định, giá trị bền vững</h2>
    <p class="text-neutral-darker">
      Chip <strong class="font-semibold text-primary">M3 Pro</strong> vẫn khẳng định sức mạnh ấn tượng trong việc xử lý đồ họa chuyên nghiệp và dựng phim. Phiên bản bộ nhớ 1TB cung cấp không gian thoải mái cho các thư viện dữ liệu lớn, kết hợp màn hình 120Hz mượt mà.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/mbp-14-m3-pro.jpg" alt="MacBook Pro 14 M3 Pro" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Sự cân bằng hoàn hảo giữa hiệu năng và giá thành</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["MacBook Pro 14 inch"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
