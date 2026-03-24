import { SeedProductInput } from "../../types";

export const pocoC71: SeedProductInput = {
  name: "Xiaomi Poco C71",
  slug: "xiaomi-poco-c71",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Poco C71 – Smartphone quốc dân, pin cực khủng</h2>
    <p class="text-neutral-darker">
      Dành cho nhu cầu sử dụng cơ bản nhưng bền bỉ, <strong class="font-semibold text-primary">Poco C71</strong> sở hữu viên pin dung lượng lớn và màn hình bảo vệ mắt. Giao diện MIUI tối ưu giúp máy vận hành ổn định cho các tác vụ nghe gọi, học tập và giải trí nhẹ nhàng.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/poco-c71.jpg" alt="Poco C71" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Sự lựa chọn kinh tế cho mọi nhu cầu hằng ngày</figcaption>
    </figure>
  `,
  brandName: "Xiaomi",
  categoryNames: ["Poco Series"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
