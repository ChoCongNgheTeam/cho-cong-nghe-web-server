import { SeedProductInput } from "../../types";

// oppo-find-n3-5g: 1 RAM duy nhất (16GB)
export const oppoFindN3: SeedProductInput = {
  name: "OPPO Find N3 5G",
  slug: "oppo-find-n3-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">OPPO Find N3 – Bậc thầy đa nhiệm trên tay bạn</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">OPPO Find N3</strong> vẫn là một trong những chiếc smartphone gập được yêu thích nhất với tỉ lệ màn hình hoàn hảo và hệ thống camera chuyên nghiệp không thua kém các dòng máy thẳng.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/find-n3.jpg" alt="OPPO Find N3 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Bền bỉ và tinh tế trong từng thao tác gập mở</figcaption>
    </figure>
  `,
  brandName: "OPPO",
  categoryNames: ["OPPO Find Series"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "fold_main_screen_size" }, { key: "ram_capacity" }],
};
