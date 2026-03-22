import { SeedProductInput } from "../../types";

// ================================================================
// Reno Series: mỗi model CHỈ CÓ 1 mức RAM → product riêng
// Không gộp. Chỉ thêm slug cứng + bỏ RAM khỏi name
// variantData: displayCard: false, chỉ dùng selector storage
// ================================================================

export const oppoReno11F_5G: SeedProductInput = {
  name: "OPPO Reno11 F 5G",
  slug: "oppo-reno11-f-5g",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">OPPO Reno11 F 5G – Vẻ đẹp thiên nhiên, sức mạnh bền bỉ</h2>
    <p class="text-neutral-darker">
      Lấy cảm hứng từ những vân đá quý tự nhiên, <strong class="font-semibold text-primary">OPPO Reno11 F 5G</strong> sở hữu mặt lưng vô cùng thu hút. Máy có khả năng kháng nước bụi bền bỉ, cùng viên pin lớn hỗ trợ sạc nhanh.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/oppo-reno11f.jpg" alt="OPPO Reno11 F 5G" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">Cảm hứng thiết kế từ thiên nhiên, hiệu năng vượt trội</figcaption>
    </figure>
  `,
  brandName: "OPPO",
  categoryNames: ["OPPO Reno Series"],
  isFeatured: false,
  variantDisplay: "CARD",
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
