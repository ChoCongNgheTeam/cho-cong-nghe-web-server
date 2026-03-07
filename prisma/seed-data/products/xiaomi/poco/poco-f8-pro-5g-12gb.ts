import { SeedProductInput } from "../../types";

export const pocoF8Pro: SeedProductInput = {
  name: "Xiaomi Poco F8 Pro 5G 12GB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Poco F8 Pro – Quái vật hiệu năng, chinh phục mọi tựa game</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Poco F8 Pro</strong> mang sức mạnh của một Flagship Killer thực thụ với vi xử lý đầu bảng và RAM 12GB. Màn hình WQHD+ 120Hz siêu nét cùng hệ thống tản nhiệt LiquidCool 4.0 giúp bạn leo rank mượt mà, không lo nóng máy.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/poco-f8-pro.jpg" alt="Poco F8 Pro 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Sức mạnh tối thượng dành cho game thủ chuyên nghiệp</figcaption>
    </figure>
  `,
  brandName: "Xiaomi",
  categoryNames: ["Poco Series"],
  isFeatured: true,
  highlights: [{ key: "inverter_tech" }, { key: "energy_label" }, { key: "cooling_capacity" }],
};
