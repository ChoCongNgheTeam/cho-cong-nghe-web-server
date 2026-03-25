import { SeedProductInput } from "../../types";

// ================================================================
// oppo-a3.ts
// Gộp từ: oppo-a3-6gb.ts + oppo-a3-8gb.ts
// Lý do: cùng model OPPO A3, chỉ khác RAM → 1 product, 2 variants
// variantData key: "oppo-a3" → displayCard: true (RAM khác nhau)
// ================================================================
export const oppoA3: SeedProductInput = {
  name: "OPPO A3",
  slug: "oppo-a3",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">OPPO A3 – Độ bền chuẩn quân đội, thiết kế thời thượng</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">OPPO A3</strong> không chỉ đẹp mà còn cực kỳ bền bỉ với khả năng chống va đập chuẩn quân đội. Có 2 phiên bản RAM 6GB và 8GB, đáp ứng mọi nhu cầu từ sử dụng cơ bản đến giải trí mạnh.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/oppo-a3.jpg" alt="OPPO A3" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Bền bỉ vượt trội, phong cách tinh tế</figcaption>
    </figure>
  `,
  brandName: "OPPO",
  categoryNames: ["OPPO A Series"],
  isFeatured: true,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "battery_capacity" }],
};
