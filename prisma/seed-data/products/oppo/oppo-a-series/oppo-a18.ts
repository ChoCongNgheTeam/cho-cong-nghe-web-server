import { SeedProductInput } from "../../types";

// oppo-a18: 1 RAM duy nhất (4GB), slug: "oppo-a18"
export const oppoA18: SeedProductInput = {
  name: "OPPO A18",
  slug: "oppo-a18",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">OPPO A18 – Màn hình 90Hz mượt mà vượt tầm giá</h2>
    <p class="text-neutral-darker">
      Dù là dòng máy khởi điểm, <strong class="font-semibold text-primary">OPPO A18</strong> vẫn được trang bị màn hình 90Hz cho trải nghiệm vuốt chạm cực mượt. Thiết kế lấp lánh và khả năng mở rộng RAM ảo giúp máy vượt qua giới hạn của một thiết bị giá rẻ.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/oppo-a18.jpg" alt="OPPO A18" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Trải nghiệm mượt mà, thiết kế nổi bật</figcaption>
    </figure>
  `,
  brandName: "OPPO",
  categoryNames: ["OPPO A Series"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "battery_capacity" }],
};
