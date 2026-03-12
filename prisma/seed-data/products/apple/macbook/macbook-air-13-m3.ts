import { SeedProductInput } from "../../types";

// MacBook Air 13 M2: 1 cấu hình duy nhất (16GB/256GB)
// → displayCard: false trong variantData
export const macbookAir13M3: SeedProductInput = {
  name: "MacBook Air 13 M3 2024",
  slug: "macbook-air-13-m3",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">
      MacBook Air 13 M2 – Lựa chọn hoàn hảo cho công việc văn phòng
    </h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">MacBook Air M2</strong> phiên bản 2024 được nâng cấp sẵn 16GB RAM giúp xử lý đa nhiệm mượt mà hơn bao giờ hết. Màn hình Liquid Retina rực rỡ cùng cổng sạc MagSafe tiện lợi biến đây thành người bạn đồng hành lý tưởng cho sinh viên và nhân viên văn phòng.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/macbook-air-m2.jpg" alt="MacBook Air 13 M2" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Thiết kế hiện đại với màn hình Liquid Retina sắc nét</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["MacBook Air 13 inch"],
  isFeatured: false,
  highlights: [{ key: "chip_m2" }, { key: "battery_life" }, { key: "no_fan_design" }],
};
