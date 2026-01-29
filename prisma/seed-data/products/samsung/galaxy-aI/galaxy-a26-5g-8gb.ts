import { SeedProductInput } from "../../types";

export const galaxyA26: SeedProductInput = {
  name: "Samsung Galaxy A26 5G 8GB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Galaxy A26 5G – Pin bền bỉ, kết nối 5G siêu tốc</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Galaxy A26 5G</strong> là lựa chọn quốc dân với viên pin 5000mAh và khả năng tối ưu hóa ứng dụng thông minh. Thiết kế hiện đại với cụm camera liền mạch mang lại vẻ ngoài thời thượng, phù hợp cho mọi nhu cầu học tập và giải trí.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/a26-5g.jpg" alt="Galaxy A26 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Bền bỉ vượt trội, trải nghiệm mượt mà trong tầm tay</figcaption>
    </figure>
  `,
  brandName: "Samsung",
  categoryNames: ["Galaxy AI"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
