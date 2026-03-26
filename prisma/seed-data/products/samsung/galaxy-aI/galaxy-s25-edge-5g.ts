import { SeedProductInput } from "../../types";

export const galaxyS25Edge: SeedProductInput = {
  name: "Samsung Galaxy S25 Edge 5G",
  slug: "samsung-galaxy-s25-edge-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Galaxy S25 Edge – Tuyệt tác màn hình tràn viền vô cực</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Galaxy S25 Edge</strong> đánh dấu sự trở lại của thiết kế màn hình cong quyến rũ. Hệ thống tản nhiệt buồng hơi lớn giúp máy duy trì hiệu suất ổn định khi chơi game nặng hoặc xử lý video 4K.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/s25-edge.jpg" alt="Galaxy S25 Edge" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Thiết kế đột phá, dẫn đầu xu hướng công nghệ</figcaption>
    </figure>
  `,
  brandName: "Samsung",
  categoryNames: ["Galaxy AI"],
  isFeatured: true,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "rear_cam_1" }],
};
