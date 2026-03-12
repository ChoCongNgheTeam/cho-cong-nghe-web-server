import { SeedProductInput } from "../../types";

export const galaxyS25: SeedProductInput = {
  name: "Samsung Galaxy S25 5G",
  slug: "samsung-galaxy-s25-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Galaxy S25 – Flagship nhỏ gọn, quyền năng vô hạn</h2>
    <p class="text-neutral-darker">
      Sở hữu thiết kế nhỏ gọn nhưng mang trong mình chip xử lý mạnh mẽ nhất, <strong class="font-semibold text-primary">Galaxy S25</strong> là minh chứng cho sức mạnh không giới hạn. Màn hình Dynamic AMOLED 2X cho độ sáng kỷ lục 2600 nits.
    </p>
  `,
  brandName: "Samsung",
  categoryNames: ["Galaxy AI"],
  isFeatured: true,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
