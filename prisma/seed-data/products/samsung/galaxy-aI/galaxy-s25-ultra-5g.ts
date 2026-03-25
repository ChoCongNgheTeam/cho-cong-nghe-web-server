import { SeedProductInput } from "../../types";

export const galaxyS25Ultra: SeedProductInput = {
  name: "Samsung Galaxy S25 Ultra 5G",
  slug: "samsung-galaxy-s25-ultra-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Galaxy S25 Ultra – Quyền năng AI và Camera 200MP tối thượng</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Galaxy S25 Ultra</strong> định nghĩa lại tiêu chuẩn flagship với khung viền Titanium siêu bền và chip Snapdragon 8 Gen 4. Galaxy AI tích hợp sâu giúp tối ưu hóa zoom xa 100x và chỉnh sửa ảnh chuyên nghiệp.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/s25-ultra.jpg" alt="Galaxy S25 Ultra" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Đỉnh cao công nghệ màn hình phẳng và bút S-Pen quyền năng</figcaption>
    </figure>
  `,
  brandName: "Samsung",
  categoryNames: ["Galaxy AI"],
  isFeatured: true,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "rear_cam_1" }],
};
