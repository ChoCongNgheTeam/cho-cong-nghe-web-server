import { SeedProductInput } from "../types";

export const appleEarPodsLightning_MM: SeedProductInput = {
  name: "Tai nghe có dây Apple EarPods Lightning (MMTN2ZA/A)",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Apple EarPods Lightning – Chất lượng chuẩn Apple</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">EarPods Lightning (MMTN2ZA/A)</strong> là phụ kiện không thể thiếu cho người dùng iPhone, hỗ trợ đàm thoại và điều khiển nhạc nhanh chóng qua phím bấm tích hợp. Khả năng chống mồ hôi và nước nhẹ giúp tai nghe bền bỉ hơn trong quá trình sử dụng hàng ngày.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/earpods-lightning-2.jpg" alt="Apple EarPods Lightning MMTN" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Phụ kiện chính hãng Apple cho chất lượng đàm thoại rõ nét</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["Tai nghe nhét tai"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
