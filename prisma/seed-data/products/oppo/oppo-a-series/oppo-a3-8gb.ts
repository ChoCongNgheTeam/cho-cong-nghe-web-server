import { SeedProductInput } from "../../types";

export const oppoA3_8GB: SeedProductInput = {
  name: "OPPO A3 8GB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">OPPO A3 – Độ bền chuẩn quân đội, thiết kế thời thượng</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">OPPO A3</strong> không chỉ đẹp mà còn cực kỳ bền bỉ với khả năng chống va đập chuẩn quân đội. Phiên bản RAM 8GB giúp bạn thoải mái giải trí, xem phim và lướt mạng xã hội mà không lo giật lag.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/oppo-a3.jpg" alt="OPPO A3" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Bền bỉ vượt trội, phong cách tinh tế</figcaption>
    </figure>
  `,
  brandName: "OPPO",
  categoryNames: ["OPPO A Series"],
  isFeatured: true,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
