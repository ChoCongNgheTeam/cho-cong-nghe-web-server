import { SeedProductInput } from "../../types";

export const pocoX7: SeedProductInput = {
  name: "Xiaomi Poco X7 5G",
  slug: "xiaomi-poco-x7-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Poco X7 5G – Trải nghiệm mượt mà, kết nối tương lai</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Poco X7 5G</strong> là sự cân bằng hoàn hảo giữa camera 108MP sắc nét và tốc độ 5G vượt trội. RAM 12GB cùng công nghệ mở rộng bộ nhớ giúp việc đa nhiệm giữa hàng chục ứng dụng trở nên nhẹ nhàng hơn bao giờ hết.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/poco-x7.jpg" alt="Poco X7 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Màn hình AMOLED rực rỡ, trải nghiệm giải trí đỉnh cao</figcaption>
    </figure>
  `,
  brandName: "Xiaomi",
  categoryNames: ["Poco Series"],
  isFeatured: true,
  highlights: [{ key: "inverter_tech" }, { key: "energy_label" }, { key: "cooling_capacity" }],
};
