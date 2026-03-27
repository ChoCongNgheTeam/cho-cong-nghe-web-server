import { SeedProductInput } from "../../types";

export const redmiNote15: SeedProductInput = {
  name: "Xiaomi Redmi Note 15",
  slug: "xiaomi-redmi-note-15",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Redmi Note 15 – Lựa chọn quốc dân, hiệu năng tin cậy</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Redmi Note 15</strong> phiên bản 6GB là sự cân bằng hoàn hảo cho nhu cầu hằng ngày. Máy được trang bị camera 50MP sắc nét và công nghệ sạc nhanh, mang lại trải nghiệm smartphone toàn diện cho người dùng phổ thông.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/redmi-note-15.jpg" alt="Redmi Note 15" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Bền bỉ, mượt mà và vô cùng kinh tế</figcaption>
    </figure>
  `,
  brandName: "Xiaomi",
  categoryNames: ["Redmi Note Series"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "battery_capacity" }],
};
