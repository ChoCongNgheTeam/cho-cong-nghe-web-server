import { SeedProductInput } from "../../types";

export const redmiNote15_5G: SeedProductInput = {
  name: "Xiaomi Redmi Note 15 5G",
  slug: "xiaomi-redmi-note-15-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Redmi Note 15 5G – Tốc độ siêu tốc cho người dùng hiện đại</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Redmi Note 15 5G</strong> kết hợp hoàn hảo giữa tốc độ mạng thế hệ mới và thiết kế vuông vức thời thượng. Màn hình bảo vệ mắt cùng hiệu năng ổn định trong tầm giá khiến đây trở thành lựa chọn không thể bỏ qua.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/redmi-note-15-5g.jpg" alt="Redmi Note 15 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Kết nối 5G mượt mà, giải trí không giới hạn</figcaption>
    </figure>
  `,
  brandName: "Xiaomi",
  categoryNames: ["Redmi Note Series"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
