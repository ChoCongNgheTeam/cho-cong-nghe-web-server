import { SeedProductInput } from "../../types";

export const galaxyZFlip7: SeedProductInput = {
  name: "Samsung Galaxy Z Flip7 5G",
  slug: "samsung-galaxy-z-flip7-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Galaxy Z Flip7 – Biểu tượng thời trang và trí tuệ nhân tạo</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Galaxy Z Flip7</strong> tỏa sáng với màn hình phụ mở rộng và khả năng cá nhân hóa vô hạn qua FlexWindow. Camera AI giúp bạn chụp ảnh từ mọi góc độ mà không cần tripod.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/z-flip7.jpg" alt="Galaxy Z Flip7" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Thiết kế nhỏ gọn, tinh tế cùng các tính năng AI đột phá</figcaption>
    </figure>
  `,
  brandName: "Samsung",
  categoryNames: ["Galaxy AI"],
  isFeatured: true,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "fold_cover_screen_size" }, { key: "battery_capacity" }],
};
