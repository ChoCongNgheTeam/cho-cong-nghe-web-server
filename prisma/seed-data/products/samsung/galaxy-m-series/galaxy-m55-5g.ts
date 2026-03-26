import { SeedProductInput } from "../../types";

export const galaxyM55: SeedProductInput = {
  name: "Samsung Galaxy M55 5G",
  slug: "samsung-galaxy-m55-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Galaxy M55 5G – Mãnh thú hiệu năng, sạc nhanh thần tốc</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">Galaxy M55 5G</strong> gây ấn tượng mạnh với thiết kế siêu mỏng nhưng sở hữu hiệu năng cực đỉnh từ chip Snapdragon và công nghệ sạc nhanh 45W. Màn hình Super AMOLED+ 120Hz mang đến trải nghiệm giải trí mượt mà, sống động.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/galaxy-m55.jpg" alt="Galaxy M55 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Trải nghiệm sức mạnh bền bỉ và tốc độ vượt trội</figcaption>
    </figure>
  `,
  brandName: "Samsung",
  categoryNames: ["Galaxy M Series"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "battery_capacity" }],
};
