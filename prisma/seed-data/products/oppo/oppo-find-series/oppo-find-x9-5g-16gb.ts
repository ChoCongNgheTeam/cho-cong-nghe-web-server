import { SeedProductInput } from "../../types";

export const oppoFindX9_16GB: SeedProductInput = {
  name: "OPPO Find X9 5G 16GB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">OPPO Find X9 5G – Sức mạnh đột phá, thiết kế sang trọng</h2>
    <p class="text-neutral-darker">
      Phiên bản RAM 16GB của <strong class="font-semibold text-primary">OPPO Find X9</strong> đáp ứng hoàn hảo mọi nhu cầu đồ họa nặng và chơi game AAA. Hệ thống tản nhiệt tiên tiến giúp máy luôn mát mẻ dù hoạt động ở cường độ cao trong thời gian dài.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/find-x9.jpg" alt="OPPO Find X9 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Cân bằng hoàn hảo giữa thẩm mỹ và hiệu năng</figcaption>
    </figure>
  `,
  brandName: "OPPO",
  categoryNames: ["OPPO Find Series"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
