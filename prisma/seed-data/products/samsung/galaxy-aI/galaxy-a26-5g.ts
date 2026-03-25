import { SeedProductInput } from "../../types";

export const galaxyA26: SeedProductInput = {
  name: "Samsung Galaxy A26 5G",
  slug: "samsung-galaxy-a26-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Galaxy A26 5G – Pin bền bỉ, kết nối 5G siêu tốc</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Galaxy A26 5G</strong> là lựa chọn quốc dân với viên pin 5000mAh và khả năng tối ưu hóa ứng dụng thông minh. Thiết kế hiện đại với cụm camera liền mạch mang lại vẻ ngoài thời thượng.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/a26-5g.jpg" alt="Galaxy A26 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Bền bỉ vượt trội, trải nghiệm mượt mà trong tầm tay</figcaption>
    </figure>
  `,
  brandName: "Samsung",
  categoryNames: ["Galaxy AI"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "battery_capacity" }],
};
