import { SeedProductInput } from "../../types";

export const galaxyA07_8GB: SeedProductInput = {
  name: "Samsung Galaxy A07 8GB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Galaxy A07 8GB – Đột phá bộ nhớ trong phân khúc phổ thông</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Galaxy A07</strong> gây bất ngờ với dung lượng RAM lên đến 8GB, giúp việc chuyển đổi giữa các ứng dụng trở nên mượt mà không độ trễ. Một người bạn đồng hành bền bỉ cho học sinh, sinh viên.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/galaxy-a07-8gb.jpg" alt="Galaxy A07 8GB" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Đa nhiệm mượt mà vượt xa mong đợi</figcaption>
    </figure>
  `,
  brandName: "Samsung",
  categoryNames: ["Galaxy A Series"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
