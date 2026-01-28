import { SeedProductInput } from "../types";

export const macbookPro16M4Max_48_1TB: SeedProductInput = {
  name: "MacBook Pro 16 M4 Max 2024 16CPU/40GPU/48GB/1TB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">MacBook Pro 16 M4 Max – Cấu hình tối thượng 40 nhân GPU</h2>
    <p class="text-neutral-darker">
      Sở hữu <strong class="font-semibold text-primary">40 nhân GPU</strong> và 48GB RAM, đây là chiếc máy tính xách tay mạnh mẽ nhất hành tinh cho xử lý AI và render chuyên nghiệp. Mọi rào cản về hiệu năng đều bị phá bỏ, giúp bạn hiện thực hóa những ý tưởng phức tạp nhất.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/mbp-16-m4-max-ultimate.jpg" alt="MacBook Pro 16 M4 Max Ultimate" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Đỉnh cao công nghệ Apple Silicon với 40 nhân GPU cực đại</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["MacBook Pro 16 inch"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
