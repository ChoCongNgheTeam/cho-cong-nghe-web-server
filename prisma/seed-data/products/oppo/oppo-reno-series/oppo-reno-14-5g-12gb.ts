import { SeedProductInput } from "../../types";

export const oppoReno14_5G: SeedProductInput = {
  name: "OPPO Reno14 5G 12GB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">OPPO Reno14 5G – Đỉnh cao sạc nhanh và đa nhiệm</h2>
    <p class="text-neutral-darker">
      Sở hữu công nghệ sạc siêu tốc SuperVOOC, <strong class="font-semibold text-primary">OPPO Reno14 5G</strong> giúp bạn luôn sẵn sàng cho mọi thử thách. RAM 12GB đảm bảo mọi ứng dụng và trò chơi nặng nhất đều vận hành một cách trơn tru, không độ trễ.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/oppo-reno14.jpg" alt="OPPO Reno14 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Năng lượng bền bỉ cho ngày dài năng động</figcaption>
    </figure>
  `,
  brandName: "OPPO",
  categoryNames: ["OPPO Reno Series"],
  isFeatured: true,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
