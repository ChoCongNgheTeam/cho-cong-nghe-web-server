import { SeedProductInput } from "../../types";

// ================================================================
// oppo-find-x9-5g.ts
// Gộp từ: oppo-find-x9-5g-12gb.ts + oppo-find-x9-5g-16gb.ts
// Lý do: cùng model Find X9 5G, chỉ khác RAM
// variantData key: "oppo-find-x9-5g" → displayCard: true
// ================================================================
export const oppoFindX9: SeedProductInput = {
  name: "OPPO Find X9 5G",
  slug: "oppo-find-x9-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">OPPO Find X9 5G – Sức mạnh đột phá, thiết kế sang trọng</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">OPPO Find X9 5G</strong> với chip xử lý hàng đầu và công nghệ sạc siêu nhanh SuperVOOC đặc trưng của OPPO. Có 2 phiên bản 12GB và 16GB RAM, phù hợp cho mọi nhu cầu từ văn phòng đến đồ họa nặng.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/find-x9.jpg" alt="OPPO Find X9 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Cân bằng hoàn hảo giữa thẩm mỹ và hiệu năng</figcaption>
    </figure>
  `,
  brandName: "OPPO",
  categoryNames: ["OPPO Find Series"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "rear_cam_1" }],
};
