import { SeedProductInput } from "../types";

export const lenovoYogaBook9: SeedProductInput = {
  name: "Laptop Lenovo Yoga Book 9 13IRU8",
  slug: "lenovo-yoga-book-9-13iru8",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Lenovo Yoga Book 9 – Laptop hai màn hình độc bản</h2>
    <p class="text-neutral-darker">
      Định nghĩa lại tương lai với hai màn hình OLED, <strong class="font-semibold text-primary">Yoga Book 9</strong> cho phép bạn sáng tạo không giới hạn ở nhiều chế độ sử dụng khác nhau.
    </p>
  `,
  brandName: "Lenovo",
  categoryNames: ["Lenovo Yoga"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
