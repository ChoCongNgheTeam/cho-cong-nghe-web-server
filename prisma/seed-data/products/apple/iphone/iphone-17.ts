import { SeedProductInput } from "../../types";

export const iphone17: SeedProductInput = {
  name: "iPhone 17",
  slug: "iphone-17",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">
      iPhone 17 – Chuẩn mực mới với màn hình ProMotion 120Hz
    </h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">iPhone 17</strong> lần đầu tiên trang bị màn hình ProMotion mượt mà và chip A19 mạnh mẽ trên dòng tiêu chuẩn. Thiết kế mỏng nhẹ kết hợp cùng camera trước 24MP giúp nâng tầm trải nghiệm selfie và gọi video sắc nét hơn bao giờ hết.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/iphone-17.jpg" alt="iPhone 17" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">iPhone 17 với nâng cấp màn hình 120Hz rực rỡ</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["iPhone 17 Series"],
  isFeatured: false,
  highlights: [{ key: "cpu_type" }, { key: "rom_capacity" }, { key: "rear_cam_1" }],
};
