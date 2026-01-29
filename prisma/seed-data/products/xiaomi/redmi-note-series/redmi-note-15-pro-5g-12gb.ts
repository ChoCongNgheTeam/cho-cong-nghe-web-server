import { SeedProductInput } from "../../types";

export const redmiNote15Pro_5G: SeedProductInput = {
  name: "Xiaomi Redmi Note 15 Pro 5G 12GB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Redmi Note 15 Pro 5G – Đỉnh cao camera 200MP và hiệu năng 5G</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Redmi Note 15 Pro 5G</strong> mang đến trải nghiệm flagship trong tầm giá trung cấp. Camera siêu phân giải 200MP kết hợp công nghệ chống rung OIS, RAM 12GB mạnh mẽ và màn hình AMOLED 120Hz rực rỡ, giúp bạn dẫn đầu mọi xu hướng công nghệ.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/redmi-note-15-pro-5g.jpg" alt="Redmi Note 15 Pro 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Trải nghiệm hình ảnh cực hạn với camera 200MP</figcaption>
    </figure>
  `,
  brandName: "Xiaomi",
  categoryNames: ["Redmi Note Series"],
  isFeatured: true,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
