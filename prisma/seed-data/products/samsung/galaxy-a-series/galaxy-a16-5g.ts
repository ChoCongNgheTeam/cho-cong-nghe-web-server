import { SeedProductInput } from "../../types";

export const galaxyA16_5G: SeedProductInput = {
  name: "Samsung Galaxy A16 5G",
  slug: "samsung-galaxy-a16-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Galaxy A16 5G – Kết nối siêu tốc, giải trí không giới hạn</h2>
    <p class="text-neutral-darker">
      Tận hưởng tốc độ mạng 5G đỉnh cao cùng <strong class="font-semibold text-primary">Galaxy A16 5G</strong>. RAM 8GB xử lý mượt mà các tựa game phổ biến và hỗ trợ công việc nhanh chóng, hiệu quả.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/galaxy-a16-5g.jpg" alt="Galaxy A16 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Sẵn sàng cho kỷ nguyên kết nối tốc độ cao</figcaption>
    </figure>
  `,
  brandName: "Samsung",
  categoryNames: ["Galaxy A Series"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "battery_capacity" }],
};
