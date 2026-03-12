import { SeedProductInput } from "../../types";

export const iphone17Pro: SeedProductInput = {
  name: "iPhone 17 Pro",
  slug: "iphone-17-pro",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">
      iPhone 17 Pro – Sức mạnh đột phá từ chip A19 Pro 2nm
    </h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">iPhone 17 Pro</strong> sở hữu vi xử lý A19 Pro sản xuất trên tiến trình 2nm tối tân, mang lại hiệu năng và khả năng tiết kiệm pin kỷ lục. Hệ thống camera FaceID ẩn dưới màn hình tạo nên không gian hiển thị vô khuyết đầy ấn tượng.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/iphone-17-pro.jpg" alt="iPhone 17 Pro" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Đẳng cấp chuyên nghiệp với iPhone 17 Pro Titanium</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["iPhone 17 Series"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
