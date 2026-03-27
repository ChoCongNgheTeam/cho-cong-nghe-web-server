import { SeedProductInput } from "../../types";

export const galaxyXCover7Pro: SeedProductInput = {
  name: "Samsung Galaxy XCover7 Pro 5G",
  slug: "samsung-galaxy-xcover7-pro-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Galaxy XCover7 Pro – Độ bền chuẩn quân đội, kết nối không giới hạn</h2>
    <p class="text-neutral-darker">
      Được thiết kế hoạt động trong môi trường khắc nghiệt nhất, <strong class="font-semibold text-primary">Galaxy XCover7 Pro</strong> đạt chuẩn bền MIL-STD-810H và kháng nước IP68. Kết nối 5G và tính năng chạm nhạy ngay cả khi đeo găng tay.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/xcover7-pro.jpg" alt="Galaxy XCover7 Pro" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Bền bỉ tuyệt đối, chinh phục mọi môi trường làm việc</figcaption>
    </figure>
  `,
  brandName: "Samsung",
  categoryNames: ["Galaxy XCover"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "battery_capacity" }],
};
