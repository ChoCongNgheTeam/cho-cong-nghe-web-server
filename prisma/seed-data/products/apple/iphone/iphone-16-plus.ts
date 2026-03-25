import { SeedProductInput } from "../../types";

export const iphone16Plus: SeedProductInput = {
  name: "iPhone 16 Plus",
  slug: "iphone-16-plus",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">
      iPhone 16 Plus – Màn hình lớn hơn, trải nghiệm lâu dài hơn
    </h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">iPhone 16 Plus</strong> mang đến không gian hiển thị 6.7 inch rộng rãi cùng thời lượng pin vượt trội cho mọi nhu cầu giải trí. Máy được trang bị chip A15 thế hệ mới, nút Điều Khiển Camera và các phiên bản màu sắc trẻ trung, thời thượng.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/iphone-16-plus.jpg" alt="iPhone 16 Plus" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">iPhone 16 Plus với màn hình lớn và pin cực khủng</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["iPhone 16 Series"],
  isFeatured: false,
  highlights: [{ key: "cpu_type" }, { key: "rom_capacity" }, { key: "battery_capacity" }],
};
