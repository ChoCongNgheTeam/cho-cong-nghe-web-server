import { SeedProductInput } from "../types";

export const macbookPro14M4Max_1TB: SeedProductInput = {
  name: "MacBook Pro 14 M4 Max 2024 14CPU/32GPU/36GB/1TB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">MacBook Pro 14 M4 Max – "Quái thú" hiệu năng thực thụ</h2>
    <p class="text-neutral-darker">
      Sở hữu <strong class="font-semibold text-primary">32 nhân GPU</strong> và 36GB RAM, đây là chiếc laptop 14 inch mạnh mẽ nhất dành cho các chuyên gia đồ họa 3D và AI. Chip M4 Max giúp phá bỏ mọi rào cản về hiệu suất, mang lại trải nghiệm làm việc như trên máy tính để bàn.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/mbp-14-m4-max.jpg" alt="MacBook Pro 14 M4 Max" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Sức mạnh tối thượng cho những công việc khó khăn nhất</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["MacBook Pro 14 inch"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
