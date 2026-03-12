import { SeedProductInput } from "../../types";

export const iphone16ProMax: SeedProductInput = {
  name: "iPhone 16 Pro Max",
  slug: "iphone-16-pro-max",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">
      iPhone 16 Pro Max – Đỉnh cao công nghệ Titanium và Chip A18 Pro
    </h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">iPhone 16 Pro Max</strong> khẳng định vị thế dẫn đầu với màn hình 6.9 inch siêu mỏng và chip A18 Pro hiệu năng vô đối. Hệ thống camera Pro 48MP cho phép quay phim 4K120fps chuyên nghiệp trong một thiết kế Titanium bền bỉ, đẳng cấp.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/iphone-16-pro-max.jpg" alt="iPhone 16 Pro Max" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Siêu phẩm iPhone 16 Pro Max với màn hình lớn nhất lịch sử</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["iPhone 16 Series"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
