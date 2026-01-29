import { SeedProductInput } from "../../types";

export const galaxyA16_4GB: SeedProductInput = {
  name: "Samsung Galaxy A16 4GB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Galaxy A16 – Sự lựa chọn tinh tế và hiệu quả</h2>
    <p class="text-neutral-darker">
      Với thiết kế mỏng nhẹ đặc trưng của dòng Galaxy A, <strong class="font-semibold text-primary">Galaxy A16 4GB</strong> mang đến sự cân bằng hoàn hảo cho các nhu cầu cơ bản. Màn hình lớn rực rỡ giúp trải nghiệm xem nội dung trở nên sống động hơn bao giờ hết.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/galaxy-a16.jpg" alt="Galaxy A16" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Thiết kế hiện đại, cầm nắm chắc chắn</figcaption>
    </figure>
  `,
  brandName: "Samsung",
  categoryNames: ["Galaxy A Series"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
