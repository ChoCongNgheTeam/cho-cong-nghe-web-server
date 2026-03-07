import { SeedProductInput } from "../../types";

export const oppoA5i_4GB: SeedProductInput = {
  name: "OPPO A5i 4GB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">OPPO A5i – Giải pháp kinh tế, chất lượng tin cậy</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">OPPO A5i 4GB</strong> là lựa chọn lý tưởng cho người dùng mới bắt đầu sử dụng smartphone. Máy thừa hưởng quy trình kiểm soát chất lượng khắt khe của OPPO, mang lại sự bền bỉ cùng giao diện vô cùng dễ sử dụng.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/oppo-a5i-4gb.jpg" alt="OPPO A5i 4GB" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Sự bền bỉ trong tầm giá phổ thông</figcaption>
    </figure>
  `,
  brandName: "OPPO",
  categoryNames: ["OPPO A Series"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
