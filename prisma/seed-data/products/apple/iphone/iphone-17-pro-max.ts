import { SeedProductInput } from "../../types";

export const iphone17ProMax: SeedProductInput = {
  name: "iPhone 17 Pro Max",
  slug: "iphone-17-pro-max",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">
      iPhone 17 Pro Max – Nhiếp ảnh điện toán với ống kính Tele 48MP
    </h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">iPhone 17 Pro Max</strong> thiết lập tiêu chuẩn nhiếp ảnh mới với bộ ba camera đều đạt độ phân giải 48MP. Màn hình lớn siêu sáng cùng khả năng kết nối vệ tinh thế hệ mới biến đây thành chiếc smartphone mạnh mẽ nhất thế giới.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/iphone-17-pro-max.jpg" alt="iPhone 17 Pro Max" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">iPhone 17 Pro Max - Trải nghiệm không giới hạn</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["iPhone 17 Series"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
