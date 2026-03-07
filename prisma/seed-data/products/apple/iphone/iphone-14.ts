import type { SeedProductInput } from "../../types";

export const iphone14: SeedProductInput = {
  name: "iPhone 14",
  description: `
    <h2 class="mt-2 text-base sm:text-xl font-semibold text-primary">
      iPhone 14 – Tuyệt tác công nghệ và khả năng quay phim hành động đỉnh cao
    </h2>

    <p class="text-neutral-darker">
      <strong class="font-semibold text-primary">iPhone 14</strong> mang đến trải nghiệm đột phá với hệ thống camera kép tiên tiến, khả năng chụp thiếu sáng ấn tượng và con chip A15 Bionic (phiên bản 5 nhân GPU) mạnh mẽ, giúp xử lý mượt mà mọi tác vụ đồ họa nặng nhất.
    </p>

    <figure class="my-6 rounded-lg overflow-hidden">
      <img
        src="https://example.com/iphone-14-tong-quan.jpg"
        alt="Tổng quan iPhone 14"
        class="mx-auto rounded-lg max-w-full"
      />
      <figcaption class="mt-2 text-xs text-neutral-dark">
        iPhone 14 - Thiết kế bền bỉ cùng nhiều lựa chọn màu sắc cá tính
      </figcaption>
    </figure>

    <h3 class="mt-5 text-base sm:text-lg font-semibold text-primary">
      Thiết kế bền bỉ với Ceramic Shield và khả năng kháng nước
    </h3>

    <p class="text-neutral-darker">
      Tiếp tục kế thừa ngôn ngữ thiết kế sang trọng, iPhone 14 được bảo vệ bởi mặt kính <strong class="font-semibold text-primary">Ceramic Shield</strong> cứng hơn bất kỳ loại kính điện thoại thông minh nào khác. Khung nhôm cao cấp chuẩn hàng không vũ trụ cùng khả năng chống nước <strong class="font-semibold text-primary">IP68</strong> mang lại sự an tâm tuyệt đối trong mọi môi trường sử dụng.
    </p>

    <figure class="my-6 rounded-lg overflow-hidden">
      <img
        src="https://example.com/iphone-14-design.jpg"
        alt="Thiết kế bền bỉ của iPhone 14"
        class="mx-auto rounded-lg max-w-full"
      />
      <figcaption class="mt-2 text-xs text-neutral-dark">
        Độ bền vượt trội với khung nhôm và mặt kính Ceramic Shield
      </figcaption>
    </figure>

    <h3 class="mt-5 text-base sm:text-lg font-semibold text-primary">
      Nâng cấp camera: Chụp đêm siêu nét và Action Mode
    </h3>

    <p class="text-neutral-darker">
      Với cảm biến lớn hơn và khẩu độ mở rộng, camera trên iPhone 14 cải thiện khả năng chụp thiếu sáng lên đến <strong class="font-semibold text-primary">2.5 lần</strong> trên camera chính. Đặc biệt, chế độ <strong class="font-semibold text-primary">Action Mode</strong> mới mang lại khả năng chống rung cực hạn, cho những thước phim mượt mà như sử dụng gimbal chuyên dụng.
    </p>

    <figure class="my-6 rounded-lg overflow-hidden">
      <img
        src="https://example.com/iphone-14-camera.jpg"
        alt="Camera iPhone 14 chuyên nghiệp"
        class="mx-auto rounded-lg max-w-full"
      />
      <figcaption class="mt-2 text-xs text-neutral-dark">
        Hệ thống camera kép mới tối ưu hóa xử lý hình ảnh Photonic Engine
      </figcaption>
    </figure>

    <h3 class="mt-5 text-base sm:text-lg font-semibold text-primary">
      Chip A15 Bionic (5 nhân GPU) – Hiệu năng thực thụ
    </h3>

    <p class="text-neutral-darker">
      Dù vẫn là <strong class="font-semibold text-primary">A15 Bionic</strong>, nhưng phiên bản trên iPhone 14 sở hữu <strong class="font-semibold text-primary">5 nhân GPU</strong> (thay vì 4 như bản tiêu chuẩn trước đây), giúp hiệu suất chơi game và các tác vụ thực tế ảo tăng cường AR trở nên vô cùng mượt mà và ổn định.
    </p>

    <h3 class="mt-5 text-base sm:text-lg font-semibold text-primary">
      Thời lượng pin ấn tượng và Tính năng an toàn
    </h3>

    <p class="text-neutral-darker">
      iPhone 14 cung cấp thời lượng sử dụng bền bỉ nhất từ trước đến nay trên các dòng iPhone tiêu chuẩn, đáp ứng nhu cầu giải trí và làm việc suốt ngày dài. Máy cũng được trang bị các tính năng an toàn đột phá như <strong class="font-semibold text-primary">Phát hiện va chạm (Crash Detection)</strong> để hỗ trợ bạn trong những tình huống khẩn cấp.
    </p>

    <figure class="my-6 rounded-lg overflow-hidden">
      <img
        src="https://example.com/iphone-14-battery.jpg"
        alt="Thời lượng pin và sạc MagSafe"
        class="mx-auto rounded-lg max-w-full"
      />
      <figcaption class="mt-2 text-xs text-neutral-dark">
        Pin bền bỉ hơn và hỗ trợ sạc không dây MagSafe tiện lợi
      </figcaption>
    </figure>
  `,
  brandName: "Apple",
  categoryNames: ["iPhone 14 Series"],
  isFeatured: false,
  highlights: [{ key: "screen_glass" }, { key: "max_brightness" }, { key: "selfie_camera_count" }],
};
