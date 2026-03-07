import { SeedProductInput } from "../../types";

export const macbookPro16M4Max_36_1TB: SeedProductInput = {
  name: "MacBook Pro 16 M4 Max 2024 14CPU/32GPU/36GB/1TB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">MacBook Pro 16 M4 Max – Sức mạnh đồ họa 32 nhân GPU</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">MacBook Pro M4 Max</strong> là con quái vật thực thụ với 32 nhân GPU, sẵn sàng chinh phục mọi dự án 3D chuyên nghiệp và video 8K. Dung lượng 1TB SSD tốc độ cao giúp lưu trữ và truy xuất các project nặng chỉ trong nháy mắt.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/mbp-16-m4-max.jpg" alt="MacBook Pro 16 M4 Max" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Chip M4 Max mạnh mẽ nhất cho công việc sáng tạo nội dung</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["MacBook Pro 16 inch"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
