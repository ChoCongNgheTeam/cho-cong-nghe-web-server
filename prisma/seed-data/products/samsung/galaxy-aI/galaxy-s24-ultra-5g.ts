import { SeedProductInput } from "../../types";

export const galaxyS24Ultra: SeedProductInput = {
  name: "Samsung Galaxy S24 Ultra 5G",
  slug: "samsung-galaxy-s24-ultra-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Galaxy S24 Ultra – Tiêu chuẩn vàng của smartphone AI</h2>
    <p class="text-neutral-darker">
      Vẫn là "ông vua" trong làng Android với bút S-Pen và camera 200MP. <strong class="font-semibold text-primary">Galaxy S24 Ultra</strong> mang đến trải nghiệm ổn định tuyệt đối và hỗ trợ cập nhật phần mềm lên đến 7 năm.
    </p>
  `,
  brandName: "Samsung",
  categoryNames: ["Galaxy AI"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "rear_cam_1" }],
};
