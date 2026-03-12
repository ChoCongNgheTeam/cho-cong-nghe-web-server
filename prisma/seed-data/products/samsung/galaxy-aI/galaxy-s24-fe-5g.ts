import { SeedProductInput } from "../../types";

export const galaxyS24FE: SeedProductInput = {
  name: "Samsung Galaxy S24 FE 5G",
  slug: "samsung-galaxy-s24-fe-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Galaxy S24 FE – Sức mạnh AI trong tầm tay</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Galaxy S24 FE</strong> kế thừa trọn vẹn bộ công cụ Galaxy AI từ dòng S24 cao cấp. Khả năng kháng nước IP68 và khung viền nhôm chắc chắn đảm bảo máy luôn bền bỉ.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/s24-fe.jpg" alt="Galaxy S24 FE" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Màn hình lớn cho trải nghiệm giải trí sống động</figcaption>
    </figure>
  `,
  brandName: "Samsung",
  categoryNames: ["Galaxy AI"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
