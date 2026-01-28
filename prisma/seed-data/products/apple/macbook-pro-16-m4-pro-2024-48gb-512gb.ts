import { SeedProductInput } from "../types";

export const macbookPro16M4Pro_48_512: SeedProductInput = {
  name: "MacBook Pro 16 M4 Pro 2024 14CPU/20GPU/48GB/512GB",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">MacBook Pro 16 M4 Pro – Đa nhiệm cực hạn với 48GB RAM</h2>
    <p class="text-neutral-darker">
      Trang bị bộ nhớ thống nhất lên đến <strong class="font-semibold text-primary">48GB</strong>, phiên bản này xử lý mượt mà các file thiết kế khổng lồ và hàng trăm tab trình duyệt cùng lúc. Chip M4 Pro đảm bảo mọi tác vụ render hay biên dịch mã nguồn đều diễn ra nhanh chóng mặt.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/mbp-16-m4-pro-48gb.jpg" alt="MacBook Pro 16 M4 Pro 48GB" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Sức mạnh đa nhiệm vượt giới hạn dành cho chuyên gia</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["MacBook Pro 16 inch"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
