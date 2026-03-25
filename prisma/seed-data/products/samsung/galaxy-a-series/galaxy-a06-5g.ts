import { SeedProductInput } from "../../types";

export const galaxyA06_5G: SeedProductInput = {
  name: "Samsung Galaxy A06 5G",
  slug: "samsung-galaxy-a06-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Galaxy A06 5G – Tiên phong công nghệ 5G giá rẻ</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Galaxy A06 5G</strong> mang tốc độ truyền tải dữ liệu cực nhanh đến gần hơn với mọi người. Dù là dòng máy phổ thông nhưng vẫn được trang bị đầy đủ các tính năng bảo mật tiên tiến nhất từ Samsung.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/galaxy-a06-5g.jpg" alt="Galaxy A06 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Tốc độ 5G trong tầm tay bạn</figcaption>
    </figure>
  `,
  brandName: "Samsung",
  categoryNames: ["Galaxy A Series"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "battery_capacity" }],
};
