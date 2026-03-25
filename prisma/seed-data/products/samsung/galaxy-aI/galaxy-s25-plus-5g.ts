import { SeedProductInput } from "../../types";

export const galaxyS25Plus: SeedProductInput = {
  name: "Samsung Galaxy S25 Plus 5G",
  slug: "samsung-galaxy-s25-plus-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Galaxy S25 Plus – Sự cân bằng hoàn hảo giữa kích thước và sức mạnh</h2>
    <p class="text-neutral-darker">
      Với màn hình QHD+ rực rỡ và dung lượng pin lớn, <strong class="font-semibold text-primary">Galaxy S25 Plus</strong> là lựa chọn giải trí đỉnh cao. Galaxy AI hỗ trợ phiên dịch trực tiếp cuộc gọi và tìm kiếm thông minh.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/s25-plus.jpg" alt="Galaxy S25 Plus" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Thiết kế bo cong tinh tế, cầm nắm thoải mái</figcaption>
    </figure>
  `,
  brandName: "Samsung",
  categoryNames: ["Galaxy AI"],
  isFeatured: true,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "rear_cam_1" }],
};
