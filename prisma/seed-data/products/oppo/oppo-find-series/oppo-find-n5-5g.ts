import { SeedProductInput } from "../../types";

// oppo-find-n5-5g: 1 RAM duy nhất (16GB)
export const oppoFindN5: SeedProductInput = {
  name: "OPPO Find N5 5G",
  slug: "oppo-find-n5-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">OPPO Find N5 – Định nghĩa lại tiêu chuẩn Smartphone màn hình gập</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">OPPO Find N5</strong> mang đến thiết kế gập không nếp nhăn kỷ lục và độ mỏng ấn tượng. Với RAM 16GB, máy xử lý đa nhiệm cực đại, cho phép mở đồng thời nhiều cửa sổ ứng dụng mà vẫn mượt mà.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/find-n5.jpg" alt="OPPO Find N5 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Trải nghiệm không giới hạn trên màn hình gập hoàn mỹ</figcaption>
    </figure>
  `,
  brandName: "OPPO",
  categoryNames: ["OPPO Find Series"],
  isFeatured: true,
  variantDisplay: "CARD",
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
