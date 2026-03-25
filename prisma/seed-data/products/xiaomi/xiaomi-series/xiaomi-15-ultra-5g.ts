import { SeedProductInput } from "../../types";

export const xiaomi15Ultra: SeedProductInput = {
  name: "Xiaomi 15 Ultra 5G",
  slug: "xiaomi-15-ultra-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Xiaomi 15 Ultra – Tuyệt tác nhiếp ảnh Leica, sức mạnh không giới hạn</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Xiaomi 15 Ultra</strong> tái định nghĩa nhiếp ảnh di động với cụm ống kính Leica Summilux thế hệ mới. RAM 16GB kết hợp cùng chip Snapdragon 8 Gen 4 mang đến hiệu năng xử lý hình ảnh và video 8K chuyên nghiệp, biến đây thành một chiếc máy ảnh thực thụ trong thân hình smartphone.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/xiaomi-15-ultra.jpg" alt="Xiaomi 15 Ultra 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Cảm biến 1-inch tối thượng cùng nghệ thuật màu sắc Leica</figcaption>
    </figure>
  `,
  brandName: "Xiaomi",
  categoryNames: ["Xiaomi Series"],
  isFeatured: true,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "rear_cam_1" }],
};
