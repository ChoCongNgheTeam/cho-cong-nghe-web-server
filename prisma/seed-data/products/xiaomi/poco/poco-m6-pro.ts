import { SeedProductInput } from "../../types";

export const pocoM6Pro: SeedProductInput = {
  name: "Xiaomi Poco M6 Pro",
  slug: "xiaomi-poco-m6-pro",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Poco M6 Pro – Giải trí không giới hạn với sạc nhanh 67W</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Poco M6 Pro</strong> gây ấn tượng với viền màn hình siêu mỏng và công nghệ sạc nhanh thần tốc. Đây là lựa chọn hàng đầu cho những ai yêu thích xem phim và sáng tạo nội dung trên mạng xã hội nhờ hệ thống camera chống rung OIS.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/poco-m6-pro.jpg" alt="Poco M6 Pro" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Camera OIS sắc nét, quay phim mượt mà</figcaption>
    </figure>
  `,
  brandName: "Xiaomi",
  categoryNames: ["Poco Series"],
  isFeatured: false,
  highlights: [{ key: "inverter_tech" }, { key: "energy_label" }, { key: "cooling_capacity" }],
};
