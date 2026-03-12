import { SeedProductInput } from "../../types";

export const macbookPro14M5Pro: SeedProductInput = {
  name: "MacBook Pro 14 M5 Pro 2025",
  slug: "macbook-pro-14-m5-pro",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">MacBook Pro 14 M5 Pro – Đỉnh cao công nghệ hiển thị và hiệu năng</h2>
    <p class="text-neutral-darker">
      Chip <strong class="font-semibold text-primary">M5 Pro</strong> mang đến băng thông bộ nhớ cực lớn, kết hợp cùng màn hình Tandem OLED (nếu có) hoặc Liquid Retina XDR cải tiến, giúp các nhà sáng tạo nội dung thực hiện các tác vụ render 3D và dựng phim 8K không độ trễ.
    </p>
  `,
  brandName: "Apple",
  categoryNames: ["MacBook Pro 14 inch"],
  isFeatured: true,
  variantDisplay: "CARD",
  highlights: [{ key: "chip_m5_pro" }, { key: "xdr_display" }, { key: "thunderbolt5" }],
};
