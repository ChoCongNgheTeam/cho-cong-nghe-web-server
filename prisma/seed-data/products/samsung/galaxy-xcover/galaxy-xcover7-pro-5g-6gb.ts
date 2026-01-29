import { SeedProductInput } from "../../types";

export const galaxyXCover7Pro: SeedProductInput = {
  name: "Samsung Galaxy XCover7 Pro 5G 6GB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Galaxy XCover7 Pro – Độ bền chuẩn quân đội, kết nối không giới hạn</h2>
    <p class="text-neutral-darker">
      Được thiết kế để hoạt động trong những môi trường khắc nghiệt nhất, <strong class="font-semibold text-primary">Galaxy XCover7 Pro</strong> đạt chuẩn bền MIL-STD-810H và kháng nước IP68. Với kết nối 5G và tính năng chạm nhạy ngay cả khi đeo găng tay, đây là thiết bị tin cậy cho mọi công việc thực địa.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/xcover7-pro.jpg" alt="Galaxy XCover7 Pro" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Bền bỉ tuyệt đối, chinh phục mọi môi trường làm việc</figcaption>
    </figure>
  `,
  brandName: "Samsung",
  categoryNames: ["Galaxy XCover"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
