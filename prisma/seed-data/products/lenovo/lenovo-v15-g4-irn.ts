import { SeedProductInput } from "../types";

export const lenovoV15G4: SeedProductInput = {
  name: "Laptop Lenovo V15 G4 IRN",
  slug: "lenovo-v15-g4-irn",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Lenovo V15 G4 – Giải pháp tối ưu chi phí</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Lenovo V15 G4</strong> tập trung vào các tính năng thiết thực nhất cho doanh nghiệp nhỏ và giáo dục, đảm bảo sự ổn định lâu dài.
    </p>
  `,
  brandName: "Lenovo",
  categoryNames: ["Lenovo Yoga"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
