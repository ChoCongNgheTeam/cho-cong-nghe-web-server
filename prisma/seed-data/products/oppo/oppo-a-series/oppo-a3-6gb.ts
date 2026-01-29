import { SeedProductInput } from "../../types";

export const oppoA3_6GB: SeedProductInput = {
  name: "OPPO A3 6GB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">OPPO A3 – Bền bỉ tối đa, giá cả hài lòng</h2>
    <p class="text-neutral-darker">
      Sở hữu cấu trúc kháng va đập tương tự bản Pro, <strong class="font-semibold text-primary">OPPO A3 6GB</strong> mang lại sự an tâm tuyệt đối khi sử dụng. RAM 6GB đủ dùng cho mọi tác vụ hằng ngày từ liên lạc đến xem video trực tuyến.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/oppo-a3-6gb.jpg" alt="OPPO A3 6GB" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Vững chãi trước mọi va chạm hằng ngày</figcaption>
    </figure>
  `,
  brandName: "OPPO",
  categoryNames: ["OPPO A Series"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
