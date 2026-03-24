import { SeedProductInput } from "../types";

export const lenovoThinkPadE14Gen5: SeedProductInput = {
  name: "Laptop Lenovo ThinkPad E14 Gen 5",
  slug: "lenovo-thinkpad-e14-gen-5",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">ThinkPad E14 Gen 5 – Độ bền chuẩn quân đội</h2>
    <p class="text-neutral-darker">
      Kế thừa di sản của dòng ThinkPad, <strong class="font-semibold text-primary">E14 Gen 5</strong> mang đến bàn phím gõ sướng nhất thế giới và độ bền bỉ đáng kinh ngạc trong một mức giá dễ tiếp cận.
    </p>
  `,
  brandName: "Lenovo",
  categoryNames: ["Lenovo ThinkPad"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
