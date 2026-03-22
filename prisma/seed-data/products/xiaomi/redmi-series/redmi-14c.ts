import { SeedProductInput } from "../../types";

export const redmi14C: SeedProductInput = {
  name: "Xiaomi Redmi 14C",
  slug: "xiaomi-redmi-14c",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Redmi 14C – Màn hình cực lớn, phong cách thời thượng</h2>
    <p class="text-neutral-darker">
      Với cụm camera hình tròn độc đáo và màn hình lên đến 6.88 inch, <strong class="font-semibold text-primary">Redmi 14C</strong> mang lại trải nghiệm xem phim và lướt web cực đã. Viên pin 5160mAh bền bỉ cùng khả năng sạc nhanh 18W đảm bảo máy luôn sẵn sàng cho mọi cuộc vui.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/redmi-14c.jpg" alt="Redmi 14C" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Thiết kế đột phá, trải nghiệm hình ảnh sống động</figcaption>
    </figure>
  `,
  brandName: "Xiaomi",
  categoryNames: ["Redmi Series"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
