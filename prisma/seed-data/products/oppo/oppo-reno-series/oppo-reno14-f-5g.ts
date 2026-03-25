import { SeedProductInput } from "../../types";

export const oppoReno14F_5G: SeedProductInput = {
  name: "OPPO Reno14 F 5G",
  slug: "oppo-reno14-f-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">OPPO Reno14 F 5G – Thiết kế mỏng nhẹ, Camera Selfie đỉnh cao</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">OPPO Reno14 F 5G</strong> tiếp tục truyền thống dòng F với thân máy siêu mỏng và trọng lượng cực nhẹ. Hệ thống camera chân dung màu AI cùng kết nối 5G cho trải nghiệm giải trí không gián đoạn.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/oppo-reno14f.jpg" alt="OPPO Reno14 F 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Vẻ đẹp tinh tế trong từng đường nét thiết kế</figcaption>
    </figure>
  `,
  brandName: "OPPO",
  categoryNames: ["OPPO Reno Series"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "rear_cam_1" }],
};
