import { SeedProductInput } from "../../types";

export const oppoA5i_6GB: SeedProductInput = {
  name: "OPPO A5i 6GB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">OPPO A5i – Sắc màu rực rỡ, pin khỏe vượt trội</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">OPPO A5i 6GB</strong> sở hữu màn hình rực rỡ với độ sáng cao, giúp hiển thị tốt ngay cả dưới ánh nắng gắt. Công nghệ bảo vệ pin thông minh giúp kéo dài tuổi thọ linh kiện, đồng thời RAM 6GB đảm bảo trải nghiệm giải trí ổn định.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/oppo-a5i.jpg" alt="OPPO A5i 6GB" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Năng động với màu sắc trẻ trung</figcaption>
    </figure>
  `,
  brandName: "OPPO",
  categoryNames: ["OPPO A Series"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
