import { SeedProductInput } from "../../types";

export const xiaomi15: SeedProductInput = {
  name: "Xiaomi 15 5G",
  slug: "xiaomi-15-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Xiaomi 15 – Flagship nhỏ gọn, hiệu năng dẫn đầu</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Xiaomi 15</strong> là sự lựa chọn hoàn hảo cho những ai yêu thích sự gọn gàng nhưng không thỏa hiệp về cấu hình. Màn hình LTPO phẳng rực rỡ và hệ thống ba camera Leica 50MP giúp máy trở thành chiếc smartphone toàn diện nhất trong phân khúc cao cấp.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/xiaomi-15.jpg" alt="Xiaomi 15 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Thiết kế tinh tế, cầm nắm hoàn hảo trong lòng bàn tay</figcaption>
    </figure>
  `,
  brandName: "Xiaomi",
  categoryNames: ["Xiaomi Series"],
  isFeatured: true,
  variantDisplay: "CARD",
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
