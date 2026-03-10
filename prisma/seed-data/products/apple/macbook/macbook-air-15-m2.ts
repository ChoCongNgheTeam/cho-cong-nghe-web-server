import { SeedProductInput } from "../../types";

// MacBook Air 15 M2: 1 cấu hình duy nhất (8GB/512GB)
// → displayCard: false
export const macbookAir15M2: SeedProductInput = {
  name: "MacBook Air 15 M2 2023",
  slug: "macbook-air-15-m2",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">MacBook Air 15 M2 – Sự cân bằng giữa sức mạnh và giá trị</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">MacBook Air 15 M2</strong> với khả năng xử lý đồ họa 10 nhân mượt mà và bộ sạc nhanh 70W đi kèm. Màn hình lớn giúp bạn dễ dàng đa nhiệm nhiều cửa sổ, tối ưu hóa năng suất làm việc di động.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/mba-15-m2.jpg" alt="MacBook Air 15 M2" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Kích thước màn hình lớn hơn cho không gian sáng tạo bất tận</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["MacBook Air 15 inch"],
  isFeatured: false,
  highlights: [{ key: "chip_m2" }, { key: "battery_life" }, { key: "six_speaker" }],
};
