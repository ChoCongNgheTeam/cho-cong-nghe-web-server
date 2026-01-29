import { SeedProductInput } from "../../types";

export const oppoA6T_4GB: SeedProductInput = {
  name: "OPPO A6T 4GB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">OPPO A6T – Đơn giản, gọn nhẹ và bền bỉ</h2>
    <p class="text-neutral-darker">
      Dành cho người dùng ưu tiên sự gọn gàng, <strong class="font-semibold text-primary">OPPO A6T 4GB</strong> đáp ứng tốt các nhu cầu cơ bản như lướt web, mạng xã hội và đàm thoại. Viên pin được tối ưu hóa giúp bạn sử dụng thoải mái suốt cả ngày dài mà không cần lo lắng về sạc.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/oppo-a6t-4gb.jpg" alt="OPPO A6T 4GB" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Thiết kế tối giản, công năng thực dụng</figcaption>
    </figure>
  `,
  brandName: "OPPO",
  categoryNames: ["OPPO A Series"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
