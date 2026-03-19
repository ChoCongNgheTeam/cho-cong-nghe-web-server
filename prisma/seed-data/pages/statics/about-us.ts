import { PageType } from "@prisma/client";
import { PageSeedData } from "../types"; // Import interface từ file types.ts của bạn

export const aboutUsPage: PageSeedData = {
  title: "Giới thiệu về ChoCongNghe Shop",
  slug: "gioi-thieu",
  type: PageType.PAGE,
  policyType: null,
  isPublished: true,
  priority: 1, 
//   metaTitle: "Giới thiệu về ChoCongNghe Shop - Nền tảng mua sắm thông minh",
//   metaDescription: "ChoCongNghe là nền tảng thương mại điện tử chuyên phân phối các sản phẩm công nghệ thông minh, mang đến trải nghiệm mua sắm trực tuyến tối ưu.",
  content: `
    <div class="text-primary leading-relaxed mb-10 w-full">
        <div class="mb-8 text-center">
            <p class="text-[12px] uppercase tracking-[0.3em] text-accent mb-2">ChoCongNghe</p>
            <h1 class="text-[24px] font-bold text-primary mb-3">Giới thiệu về ChoCongNghe Shop</h1>
            <p class="text-primary max-w-2xl mx-auto">ChoCongNghe là nền tảng thương mại điện tử chuyên biệt về thiết kế và phân phối các sản phẩm công nghệ thông minh, tối ưu cho trải nghiệm mua sắm trực tuyến trong kỷ nguyên số.</p>
        </div>

        <section class="mb-8">
            <h2 class="font-bold text-primary mb-4 text-center">Nhận diện thương hiệu</h2>
            <div class="grid gap-4 sm:grid-cols-3">
                <div class="rounded-lg border border-neutral-light bg-white p-4 flex items-center justify-center">
                    <img src="/logo.png" alt="Logo ChoCongNghe" width="140" height="140" class="h-auto w-28 sm:w-32" />
                </div>
                <div class="rounded-lg border border-neutral-light bg-white p-4">
                    <img src="/welcome.png" alt="Hình ảnh mẫu 1" width="360" height="240" class="h-auto w-full rounded-md" />
                </div>
                <div class="rounded-lg border border-neutral-light bg-white p-4">
                    <img src="/images/avatar.png" alt="Hình ảnh mẫu 2" width="360" height="240" class="h-auto w-full rounded-md" />
                </div>
            </div>
        </section>

        <section class="mb-8">
            <h2 class="font-bold text-primary mb-2">1. Tổng quan</h2>
            <p class="mb-3 text-primary">Với mục tiêu xây dựng một hệ sinh thái mua sắm hiện đại, tiện lợi và đáng tin cậy, ChoCongNghe mang đến cho khách hàng cơ hội tiếp cận những thiết kế công nghệ tiên tiến nhất thông qua giao diện trực quan và quy trình thanh toán tối giản.</p>
            <p class="text-primary">Dự án được phát triển theo định hướng lấy người dùng làm trung tâm, đồng thời đảm bảo khả năng mở rộng linh hoạt để đáp ứng nhu cầu tăng trưởng dài hạn.</p>
        </section>

        <section class="mb-8">
            <h2 class="font-bold text-primary mb-4">2. Điểm nổi bật</h2>
            <div class="grid gap-4 md:grid-cols-2">
                <div class="rounded-lg border border-neutral-light bg-neutral-light/20 p-4">
                    <p class="font-semibold text-primary mb-1">Danh mục thông minh</p>
                    <p class="text-primary">Hệ thống quản lý danh mục sản phẩm linh hoạt, giúp phân loại và hiển thị chính xác theo nhu cầu.</p>
                </div>
                <div class="rounded-lg border border-neutral-light bg-neutral-light/20 p-4">
                    <p class="font-semibold text-primary mb-1">Tìm kiếm tối ưu</p>
                    <p class="text-primary">Bộ lọc nhanh và chính xác giúp người dùng tìm được thiết bị phù hợp chỉ trong vài thao tác.</p>
                </div>
                <div class="rounded-lg border border-neutral-light bg-neutral-light/20 p-4">
                    <p class="font-semibold text-primary mb-1">Thanh toán đa phương thức</p>
                    <p class="text-primary">Tích hợp nhiều lựa chọn thanh toán an toàn, tối giản hóa quy trình mua sắm.</p>
                </div>
                <div class="rounded-lg border border-neutral-light bg-neutral-light/20 p-4">
                    <p class="font-semibold text-primary mb-1">Theo dõi đơn hàng thời gian thực</p>
                    <p class="text-primary">Cập nhật trạng thái đơn hàng minh bạch, giúp khách hàng chủ động trong mọi bước.</p>
                </div>
            </div>
        </section>

        <section class="mb-8">
            <h2 class="font-bold text-primary mb-4">3. Dành cho khách hàng & quản trị viên</h2>
            <div class="grid gap-4 md:grid-cols-2">
                <div class="rounded-lg border border-neutral-light bg-white p-4">
                    <p class="font-semibold text-primary mb-2">Khách hàng</p>
                    <ul class="space-y-2">
                        <li class="flex gap-2">
                            <span class="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                            <p class="text-primary">Khám phá nhanh các thiết bị công nghệ thông minh.</p>
                        </li>
                        <li class="flex gap-2">
                            <span class="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                            <p class="text-primary">So sánh lựa chọn rõ ràng với thông tin minh bạch.</p>
                        </li>
                        <li class="flex gap-2">
                            <span class="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                            <p class="text-primary">Trải nghiệm thanh toán gọn gàng và bảo mật.</p>
                        </li>
                    </ul>
                </div>
                <div class="rounded-lg border border-neutral-light bg-white p-4">
                    <p class="font-semibold text-primary mb-2">Quản trị viên</p>
                    <ul class="space-y-2">
                        <li class="flex gap-2">
                            <span class="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                            <p class="text-primary">Quản lý kho hàng và danh mục hiệu quả.</p>
                        </li>
                        <li class="flex gap-2">
                            <span class="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                            <p class="text-primary">Theo dõi doanh thu và dữ liệu khách hàng khoa học.</p>
                        </li>
                        <li class="flex gap-2">
                            <span class="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                            <p class="text-primary">Vận hành linh hoạt với hệ thống báo cáo rõ ràng.</p>
                        </li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="mb-8">
            <h2 class="font-bold text-primary mb-3">4. Cam kết vận hành</h2>
            <ul class="space-y-3">
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p class="text-primary"><span class="font-semibold text-primary">Bảo mật:</span> Ưu tiên an toàn dữ liệu khách hàng và tuân thủ các tiêu chuẩn bảo mật.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p class="text-primary"><span class="font-semibold text-primary">Hiệu năng:</span> Tối ưu tốc độ tải trang, bảo đảm trải nghiệm mượt mà khi truy cập.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p class="text-primary"><span class="font-semibold text-primary">Mở rộng:</span> Kiến trúc linh hoạt giúp nền tảng sẵn sàng phục vụ lượng truy cập lớn.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p class="text-primary"><span class="font-semibold text-primary">Chuẩn SEO:</span> Cấu trúc thân thiện tìm kiếm giúp nội dung dễ tiếp cận và phát triển bền vững.</p>
                </li>
            </ul>
        </section>

        <section>
            <h2 class="font-bold text-primary mb-2">5. Sứ mệnh</h2>
            <p class="text-primary">ChoCongNghe hướng tới việc trở thành nền tảng mua sắm thông minh, nơi kết nối giữa giá trị sản phẩm và nhu cầu thực tế của người tiêu dùng, đồng thời thúc đẩy sự phát triển của thương mại điện tử trong ngành công nghệ.</p>
        </section>
    </div>
  `.trim()
};