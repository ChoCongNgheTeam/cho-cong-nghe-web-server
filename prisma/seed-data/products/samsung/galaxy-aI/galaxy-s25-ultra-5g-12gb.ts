import { SeedProductInput } from "../../types";

export const galaxyS25Ultra: SeedProductInput = {
  name: "Samsung Galaxy S25 Ultra 5G 12GB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Galaxy S25 Ultra – Quyền năng AI và Camera 200MP tối thượng</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Galaxy S25 Ultra</strong> định nghĩa lại tiêu chuẩn flagship với khung viền Titanium siêu bền và chip Snapdragon 8 Gen 4 cực khủng. Hệ thống Galaxy AI tích hợp sâu giúp tối ưu hóa khả năng zoom xa 100x và chỉnh sửa ảnh chuyên nghiệp chỉ bằng một chạm.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/s25-ultra.jpg" alt="Galaxy S25 Ultra" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Đỉnh cao công nghệ màn hình phẳng và bút S-Pen quyền năng</figcaption>
    </figure>
  `,
  brandName: "Samsung",
  categoryNames: ["Galaxy AI"],
  isFeatured: true,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
