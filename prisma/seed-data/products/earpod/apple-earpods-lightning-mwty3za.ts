import { SeedProductInput } from "../types";

export const appleEarPodsLightning_MW: SeedProductInput = {
  name: "Tai nghe có dây Apple EarPods Lightning (MWTY3ZA/A)",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Apple EarPods Lightning – Trải nghiệm âm thanh cổ điển</h2>
    <p class="text-neutral-darker">
      Thiết kế hình học ôm sát vành tai giúp <strong class="font-semibold text-primary">EarPods Lightning</strong> tạo cảm giác dễ chịu khi đeo lâu. Loa bên trong được kỹ thuật hóa để tối đa hóa đầu ra âm thanh và giảm thiểu tổn thất, mang đến âm bass sâu, ấm và rõ nét cho các dòng iPhone cổng Lightning.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/earpods-lightning.jpg" alt="Apple EarPods Lightning" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">EarPods Lightning truyền thống, ổn định và bền bỉ</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["Tai nghe nhét tai"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
