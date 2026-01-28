import { SeedProductInput } from "../types";

export const appleAirPodsPro3: SeedProductInput = {
  name: "Tai nghe Apple AirPods Pro 3 2025 USB-C",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">AirPods Pro 3 – Đỉnh cao chống ồn và âm thanh không gian</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">AirPods Pro 3 (2025)</strong> trang bị chip H3 mới nhất, tăng cường khả năng khử tiếng ồn chủ động gấp 2 lần. Cổng sạc USB-C hiện đại cùng tính năng theo dõi sức khỏe thính giác biến đây thành chiếc tai nghe không dây thông minh nhất thế giới hiện nay.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/airpods-pro-3.jpg" alt="AirPods Pro 3 2025" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">AirPods Pro thế hệ mới với khả năng chống ồn vượt bậc</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["Tai nghe nhét tai"],
  isFeatured: true,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
