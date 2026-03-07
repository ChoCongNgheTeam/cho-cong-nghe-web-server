import { SeedProductInput } from "../../types";

export const galaxyA36: SeedProductInput = {
  name: "Samsung Galaxy A36 5G 8GB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Galaxy A36 5G – Kết nối tốc độ, trải nghiệm mượt mà</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Galaxy A36 5G</strong> mang lại tốc độ 5G siêu nhanh trong một thiết kế tối giản, sang trọng. Máy được tối ưu hóa cho các tác vụ giải trí đa phương tiện với loa kép âm thanh nổi và khả năng kháng nước bụi chuẩn IP67 bền bỉ.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/galaxy-a36.jpg" alt="Galaxy A36 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Giải trí không gián đoạn với hiệu năng ổn định</figcaption>
    </figure>
  `,
  brandName: "Samsung",
  categoryNames: ["Galaxy AI"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
