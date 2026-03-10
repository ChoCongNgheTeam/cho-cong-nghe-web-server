import { SeedProductInput } from "../../types";

export const oppoReno15_5G: SeedProductInput = {
  name: "OPPO Reno15 5G",
  slug: "oppo-reno15-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">OPPO Reno15 5G – Chuyên gia chân dung AI thế hệ mới</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">OPPO Reno15 5G</strong> định nghĩa lại khả năng nhiếp ảnh di động với hệ thống camera AI đột phá. Thiết kế mặt lưng dòng chảy thời thượng kết hợp màn hình cong 120Hz mang lại trải nghiệm sang trọng và mượt mà.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/oppo-reno15.jpg" alt="OPPO Reno15 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Thiết kế mỏng nhẹ, đẳng cấp cùng hiệu năng AI vượt trội</figcaption>
    </figure>
  `,
  brandName: "OPPO",
  categoryNames: ["OPPO Reno Series"],
  isFeatured: true,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
