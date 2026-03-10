import { SeedProductInput } from "../../types";

export const oppoReno15F_5G: SeedProductInput = {
  name: "OPPO Reno15 F 5G",
  slug: "oppo-reno15-f-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">OPPO Reno15 F 5G – Thiết kế sành điệu, kết nối cực nhanh</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Reno15 F 5G</strong> là sự lựa chọn hoàn hảo cho giới trẻ yêu thích thời trang và công nghệ. Máy mỏng nhẹ kỷ lục nhưng vẫn mang trong mình sức mạnh 5G và hệ thống camera bắt trọn mọi khoảnh khắc.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/oppo-reno15f.jpg" alt="OPPO Reno15 F 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Mỏng nhẹ phong cách, chụp ảnh chuyên nghiệp</figcaption>
    </figure>
  `,
  brandName: "OPPO",
  categoryNames: ["OPPO Reno Series"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
