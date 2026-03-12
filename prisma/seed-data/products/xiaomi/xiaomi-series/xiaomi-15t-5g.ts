import { SeedProductInput } from "../../types";

export const xiaomi15T: SeedProductInput = {
  name: "Xiaomi 15T 5G",
  slug: "xiaomi-15t-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Xiaomi 15T – Trải nghiệm cao cấp trong tầm tay</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Xiaomi 15T</strong> mang đến những giá trị cốt lõi của dòng Flagship với mức giá dễ tiếp cận hơn. Camera chính độ phân giải cao và màn hình CrystalRes bảo vệ mắt giúp bạn tận hưởng nội dung giải trí một cách trọn vẹn nhất.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/xiaomi-15t.jpg" alt="Xiaomi 15T 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Sự cân bằng hoàn hảo giữa tính năng và giá trị</figcaption>
    </figure>
  `,
  brandName: "Xiaomi",
  categoryNames: ["Xiaomi Series"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
