import { SeedProductInput } from "../../types";

export const galaxyA17: SeedProductInput = {
  name: "Samsung Galaxy A17",
  slug: "samsung-galaxy-a17",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Galaxy A17 – Trải nghiệm mượt mà, lưu trữ thả ga</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Galaxy A17</strong> mang đến khả năng đa nhiệm ấn tượng trong phân khúc tầm trung. Màn hình sắc nét cùng thiết kế trẻ trung giúp bạn tự tin thể hiện cá tính mỗi ngày.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/galaxy-a17.jpg" alt="Galaxy A17" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Hiệu năng ổn định cho mọi nhu cầu hằng ngày</figcaption>
    </figure>
  `,
  brandName: "Samsung",
  categoryNames: ["Galaxy A Series"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "battery_capacity" }],
};
