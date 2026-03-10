import { SeedProductInput } from "../../types";

export const redmiNote14: SeedProductInput = {
  name: "Xiaomi Redmi Note 14",
  slug: "xiaomi-redmi-note-14",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Redmi Note 14 – Pin khỏe, màn hình lớn cho mọi nhà</h2>
    <p class="text-neutral-darker">
      Với màn hình lớn sắc nét và thời lượng pin vượt trội, <strong class="font-semibold text-primary">Redmi Note 14 6GB</strong> đáp ứng tốt nhu cầu xem video và liên lạc liên tục. Giao diện mượt mà và thiết kế chắc chắn là điểm cộng lớn cho mẫu máy này.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/redmi-note-14.jpg" alt="Redmi Note 14" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Người bạn đồng hành bền bỉ mỗi ngày</figcaption>
    </figure>
  `,
  brandName: "Xiaomi",
  categoryNames: ["Redmi Note Series"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
