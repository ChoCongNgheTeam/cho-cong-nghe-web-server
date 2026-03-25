import { SeedProductInput } from "../types";

export const appleAirPodsPro3: SeedProductInput = {
  name: "Apple AirPods Pro 3 2025",
  slug: "apple-airpods-pro-3",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">AirPods Pro 3 – Đỉnh cao chống ồn và âm thanh không gian</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">AirPods Pro 3 (2025)</strong> trang bị chip H3 mới nhất, tăng cường khả năng khử tiếng ồn chủ động gấp 2 lần. Cổng sạc USB-C hiện đại cùng tính năng theo dõi sức khỏe thính giác biến đây thành chiếc tai nghe không dây thông minh nhất hiện nay.
    </p>
  `,
  brandName: "Apple",
  categoryNames: ["Tai nghe không dây"],
  isFeatured: true,
  highlights: [{ key: "battery_capacity" }, { key: "bluetooth_version" }, { key: "water_resistance" }],
};
