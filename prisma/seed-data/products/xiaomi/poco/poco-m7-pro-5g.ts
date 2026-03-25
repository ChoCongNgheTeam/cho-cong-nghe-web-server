import { SeedProductInput } from "../../types";

export const pocoM7Pro: SeedProductInput = {
  name: "Xiaomi Poco M7 Pro 5G",
  slug: "xiaomi-poco-m7-pro-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Poco M7 Pro 5G – Tốc độ dẫn đầu phân khúc tầm trung</h2>
    <p class="text-neutral-darker">
      Đưa công nghệ 5G đến gần hơn với mọi người, <strong class="font-semibold text-primary">Poco M7 Pro</strong> sở hữu chip xử lý tiến trình mới tiết kiệm điện năng. RAM 8GB và viên pin 5000mAh đảm bảo máy luôn bền bỉ đồng hành cùng bạn suốt cả ngày dài làm việc.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/poco-m7-pro.jpg" alt="Poco M7 Pro 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Thiết kế hiện đại, hiệu năng vượt trội trong tầm giá</figcaption>
    </figure>
  `,
  brandName: "Xiaomi",
  categoryNames: ["Poco Series"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "battery_capacity" }],
};
