import { SeedProductInput } from "../../types";

export const oppoReno12F_5G: SeedProductInput = {
  name: "OPPO Reno12 F 5G 8GB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">OPPO Reno12 F 5G – Kết nối tương lai, chụp ảnh chuyên nghiệp</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">OPPO Reno12 F 5G</strong> được trang bị hệ thống camera vòng sáng đồng tâm độc đáo, hỗ trợ nhiều chế độ chụp ảnh chân dung nghệ thuật. Kết nối 5G ổn định giúp bạn luôn dẫn đầu trong công việc và giải trí.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/oppo-reno12f.jpg" alt="OPPO Reno12 F 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Bừng sáng phong cách với vòng sáng Halo độc đáo</figcaption>
    </figure>
  `,
  brandName: "OPPO",
  categoryNames: ["OPPO Reno Series"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
