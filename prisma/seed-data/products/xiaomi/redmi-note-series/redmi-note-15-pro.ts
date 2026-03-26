import { SeedProductInput } from "../../types";

export const redmiNote15Pro: SeedProductInput = {
  name: "Xiaomi Redmi Note 15 Pro",
  slug: "xiaomi-redmi-note-15-pro",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Redmi Note 15 Pro – Trải nghiệm màn hình 1.5K siêu thực</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Redmi Note 15 Pro</strong> mang đến chuẩn hiển thị cao cấp với độ phân giải 1.5K rực rỡ và tần số quét 120Hz. Với dung lượng RAM 12GB, máy xử lý mượt mà mọi tác vụ từ làm việc đến giải trí, đi kèm hệ thống loa kép Dolby Atmos sống động.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/redmi-note-15-pro.jpg" alt="Redmi Note 15 Pro" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Màn hình rực rỡ, hiệu năng ấn tượng trong tầm tay</figcaption>
    </figure>
  `,
  brandName: "Xiaomi",
  categoryNames: ["Redmi Note Series"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "battery_capacity" }],
};
