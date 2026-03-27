import { SeedProductInput } from "../../types";

export const galaxyA56: SeedProductInput = {
  name: "Samsung Galaxy A56 5G",
  slug: "samsung-galaxy-a56-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Galaxy A56 5G – Hiệu năng mạnh mẽ, camera 50MP sắc nét</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Galaxy A56 5G</strong> mang các tính năng Galaxy AI cao cấp xuống dòng cận cao cấp. Màn hình Super AMOLED 120Hz rực rỡ và thời lượng pin sử dụng lên đến 2 ngày.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/galaxy-a56.jpg" alt="Galaxy A56 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Camera AI sắc nét trong mọi điều kiện ánh sáng</figcaption>
    </figure>
  `,
  brandName: "Samsung",
  categoryNames: ["Galaxy AI"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "battery_capacity" }],
};
