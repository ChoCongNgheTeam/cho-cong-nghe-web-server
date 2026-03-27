import { SeedProductInput } from "../../types";

export const redmiNote14ProPlus: SeedProductInput = {
  name: "Xiaomi Redmi Note 14 Pro Plus 5G",
  slug: "xiaomi-redmi-note-14-pro-plus-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Redmi Note 14 Pro Plus – Siêu phẩm bền bỉ, pin khủng 6200mAh</h2>
    <p class="text-neutral-darker">
      Đứng đầu về độ bền, <strong class="font-semibold text-primary">Redmi Note 14 Pro Plus</strong> sở hữu khả năng chống va đập và kháng nước chuẩn IP69. Viên pin Silicon-Carbon dung lượng cực đại 6200mAh đảm bảo bạn không bao giờ phải lo lắng về việc sạc pin trong suốt cả ngày dài năng động.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/redmi-note-14-pro-plus.jpg" alt="Redmi Note 14 Pro Plus 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Bền bỉ tuyệt đối, năng lượng bất tận</figcaption>
    </figure>
  `,
  brandName: "Xiaomi",
  categoryNames: ["Redmi Note Series"],
  isFeatured: true,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "battery_capacity" }],
};
