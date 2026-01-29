import { SeedProductInput } from "../../types";

export const galaxyA56: SeedProductInput = {
  name: "Samsung Galaxy A56 5G 8GB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Galaxy A56 5G – Hiệu năng mạnh mẽ, camera 50MP sắc nét</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Galaxy A56 5G</strong> mang các tính năng Galaxy AI cao cấp xuống dòng máy cận cao cấp. Với màn hình Super AMOLED 120Hz rực rỡ và thời lượng pin sử dụng lên đến 2 ngày, đây là người bạn đồng hành lý tưởng cho giới trẻ năng động.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/galaxy-a56.jpg" alt="Galaxy A56 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Camera AI sắc nét trong mọi điều kiện ánh sáng</figcaption>
    </figure>
  `,
  brandName: "Samsung",
  categoryNames: ["Galaxy AI"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
