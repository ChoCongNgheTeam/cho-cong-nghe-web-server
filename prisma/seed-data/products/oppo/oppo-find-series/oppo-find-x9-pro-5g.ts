import { SeedProductInput } from "../../types";

// oppo-find-x9-pro-5g: 1 RAM duy nhất (16GB)
export const oppoFindX9Pro: SeedProductInput = {
  name: "OPPO Find X9 Pro 5G",
  slug: "oppo-find-x9-pro-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">OPPO Find X9 Pro – Tuyệt tác công nghệ và Nhiếp ảnh Hasselblad</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">OPPO Find X9 Pro</strong> sở hữu sức mạnh vô song với RAM 16GB và hệ thống camera cảm biến 1-inch phối hợp cùng Hasselblad. Màn hình LTPO 120Hz và khả năng xử lý hình ảnh AI đỉnh cao biến mọi khung hình trở thành tác phẩm nghệ thuật.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/find-x9-pro.jpg" alt="OPPO Find X9 Pro 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Đỉnh cao Flagship với camera zoom tiềm vọng sắc nét</figcaption>
    </figure>
  `,
  brandName: "OPPO",
  categoryNames: ["OPPO Find Series"],
  isFeatured: true,
  variantDisplay: "CARD",
  highlights: [{ key: "cpu_type" }, { key: "ram_capacity" }, { key: "rear_cam_1" }],
};
