import { SeedProductInput } from "../../types";

export const xiaomi15TPro: SeedProductInput = {
  name: "Xiaomi 15T Pro 5G",
  slug: "xiaomi-15t-pro-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Xiaomi 15T Pro – Bứt phá tốc độ với sạc nhanh 120W</h2>
    <p class="text-neutral-darker">
      Dòng T-Pro quay trở lại với khả năng tối ưu hóa chơi game cực đỉnh. <strong class="font-semibold text-primary">Xiaomi 15T Pro</strong> trang bị màn hình 144Hz siêu mượt và công nghệ sạc HyperCharge giúp đầy pin chỉ trong "nháy mắt", đảm bảo cuộc vui không bao giờ gián đoạn.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/xiaomi-15t-pro.jpg" alt="Xiaomi 15T Pro 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Hiệu năng mạnh mẽ, sạc nhanh thần tốc</figcaption>
    </figure>
  `,
  brandName: "Xiaomi",
  categoryNames: ["Xiaomi Series"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "rear_cam_1" }],
};
