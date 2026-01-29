import { SeedProductInput } from "../../types";

export const macbookPro14M5_24_512: SeedProductInput = {
  name: "Macbook Pro 14 M5 2025 10CPU/10GPU/24GB/512GB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Macbook Pro 14 M5 – Đa nhiệm mượt mà với 24GB RAM</h2>
    <p class="text-neutral-darker">
      Với bộ nhớ thống nhất lên đến <strong class="font-semibold text-primary">24GB</strong>, MacBook Pro M5 phiên bản 2025 xử lý dễ dàng các ứng dụng sáng tạo nặng nề nhất. Thiết kế tản nhiệt mới giúp máy luôn mát mẻ và yên tĩnh ngay cả khi xử lý các tác vụ render phức tạp.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/mbp-14-m5-24gb.jpg" alt="MacBook Pro 14 M5 24GB" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Hiệu năng đa nhiệm đỉnh cao trong thân hình gọn nhẹ</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["MacBook Pro 14 inch"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
