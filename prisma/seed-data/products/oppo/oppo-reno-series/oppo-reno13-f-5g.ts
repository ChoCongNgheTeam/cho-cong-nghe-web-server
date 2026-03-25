import { SeedProductInput } from "../../types";

export const oppoReno13F_5G: SeedProductInput = {
  name: "OPPO Reno13 F 5G",
  slug: "oppo-reno13-f-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">OPPO Reno13 F 5G – Đa nhiệm mượt mà với RAM 12GB</h2>
    <p class="text-neutral-darker">
      Với RAM 12GB, <strong class="font-semibold text-primary">OPPO Reno13 F 5G</strong> mang đến khả năng xử lý đa tác vụ vượt trội trong phân khúc. Màn hình AMOLED rực rỡ và tần số quét cao giúp mọi chuyển động trở nên mượt mà.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/oppo-reno13f.jpg" alt="OPPO Reno13 F 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Sức mạnh đa nhiệm, phong cách trẻ trung</figcaption>
    </figure>
  `,
  brandName: "OPPO",
  categoryNames: ["OPPO Reno Series"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "rear_cam_1" }],
};
