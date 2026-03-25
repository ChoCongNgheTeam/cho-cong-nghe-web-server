import { SeedProductInput } from "../../types";

export const galaxyS25FE: SeedProductInput = {
  name: "Samsung Galaxy S25 FE 5G",
  slug: "samsung-galaxy-s25-fe-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Galaxy S25 FE – Trải nghiệm Flagship với mức giá tối ưu</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Galaxy S25 FE</strong> mang đến những tính năng AI cốt lõi và hiệu năng mạnh mẽ trong một mức giá dễ tiếp cận. Màn hình Dynamic AMOLED 2X 120Hz cùng hệ thống camera chuyên nghiệp.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/s25-fe.jpg" alt="Galaxy S25 FE" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Sự kết hợp hoàn hảo giữa hiệu năng và giá trị</figcaption>
    </figure>
  `,
  brandName: "Samsung",
  categoryNames: ["Galaxy AI"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "rear_cam_1" }],
};
