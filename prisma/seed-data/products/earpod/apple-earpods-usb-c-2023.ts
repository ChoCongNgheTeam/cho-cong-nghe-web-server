import { SeedProductInput } from "../types";

export const appleEarPodsUSBC: SeedProductInput = {
  name: "Tai nghe có dây Apple EarPods USB-C 2023 (MYQY3ZA/A)",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">Apple EarPods USB-C – Âm thanh thuần khiết, kết nối hiện đại</h2>
    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">EarPods USB-C</strong> mang đến chất lượng âm thanh kỹ thuật số cao cấp và sự thoải mái tối ưu. Với đầu nối USB-C, tai nghe tương thích hoàn hảo với các dòng iPhone 15, 16 trở lên cùng iPad và MacBook, tích hợp cụm điều khiển âm lượng và micro tiện dụng.
    </p>
    <figure class="my-6 rounded-lg overflow-hidden">
      <img src="https://example.com/earpods-usb-c.jpg" alt="Apple EarPods USB-C" class="mx-auto rounded-lg max-w-full" />
      <figcaption class="mt-2 text-xs text-neutral-dark">EarPods với đầu nối USB-C hỗ trợ nghe nhạc Lossless</figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["Tai nghe nhét tai"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
