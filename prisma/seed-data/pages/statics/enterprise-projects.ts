import { PageType } from "@prisma/client";
import { PageSeedData } from "../types";

export const enterpriseProjectsPage: PageSeedData = {
  title: "Dự án Doanh nghiệp",
  slug: "du-an-doanh-nghiep",
  type: PageType.PAGE,
  policyType: null,
  isPublished: true,
  priority: 4, // Đặt thứ tự hiển thị ưu tiên theo hệ thống của bạn
//   metaTitle: "Dự án Doanh nghiệp - Cung cấp thiết bị số lượng lớn | ChoCongNghe",
//   metaDescription: "ChoCongNghe cung cấp giải pháp mua sắm, tư vấn cấu hình và triển khai thiết bị số lượng lớn cho doanh nghiệp với chính sách giá ưu đãi và dịch vụ bảo hành tận nơi.",
  content: `
    <div class="text-primary leading-relaxed mb-10 w-full">
        <h1 class="text-[24px] font-bold text-primary text-center mb-7">
            Dự án Doanh nghiệp
        </h1>

        <section class="mb-6">
            <h2 class="font-bold text-primary mb-2">1. Tổng quan</h2>
            <p class="text-primary">
                ChoCongNghe cung cấp giải pháp mua sắm và triển khai thiết bị cho
                doanh nghiệp, tổ chức giáo dục và đối tác dự án. Chúng tôi ưu tiên
                tối ưu chi phí, đảm bảo tiến độ và hỗ trợ kỹ thuật trong suốt vòng
                đời dự án.
            </p>
        </section>

        <section class="mb-6">
            <h2 class="font-bold text-primary mb-2">
                2. Giải pháp & quyền lợi
            </h2>
            <ul class="space-y-2">
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p class="text-primary">Cung cấp thiết bị số lượng lớn với chính sách giá riêng cho doanh nghiệp.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p class="text-primary">Tư vấn cấu hình, tối ưu chi phí theo nhu cầu sử dụng thực tế.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p class="text-primary">Hỗ trợ triển khai đồng bộ, cài đặt ban đầu và bàn giao kỹ thuật.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p class="text-primary">Bảo hành, hậu mãi và hỗ trợ kỹ thuật theo SLA thỏa thuận.</p>
                </li>
            </ul>
        </section>

        <section class="mb-6">
            <h2 class="font-bold text-primary mb-2">3. Quy trình triển khai</h2>
            <ol class="space-y-2">
                <li class="flex gap-2.5">
                    <span class="shrink-0 font-semibold text-accent">1.</span>
                    <p class="text-primary">Tiếp nhận yêu cầu và khảo sát nhu cầu doanh nghiệp.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="shrink-0 font-semibold text-accent">2.</span>
                    <p class="text-primary">Đề xuất giải pháp, cấu hình và báo giá chi tiết.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="shrink-0 font-semibold text-accent">3.</span>
                    <p class="text-primary">Ký kết hợp đồng và kế hoạch triển khai.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="shrink-0 font-semibold text-accent">4.</span>
                    <p class="text-primary">Giao hàng, lắp đặt và nghiệm thu.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="shrink-0 font-semibold text-accent">5.</span>
                    <p class="text-primary">Hỗ trợ vận hành, bảo hành và bảo trì định kỳ.</p>
                </li>
            </ol>
        </section>

        <section class="mb-6">
            <h2 class="font-bold text-primary mb-2">4. Hồ sơ cần chuẩn bị</h2>
            <ul class="space-y-2">
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p class="text-primary">Thông tin doanh nghiệp và đầu mối liên hệ.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p class="text-primary">Danh sách thiết bị, số lượng và cấu hình mong muốn.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p class="text-primary">Địa điểm triển khai và thời gian dự kiến.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p class="text-primary">Yêu cầu đặc thù (nếu có) về bảo mật hoặc tích hợp hệ thống.</p>
                </li>
            </ul>
        </section>

        <section>
            <h2 class="font-bold text-primary mb-2">5. Liên hệ tư vấn</h2>
            <p class="text-primary">
                Vui lòng để lại nhu cầu dự án và thông tin liên hệ. Bộ phận phụ
                trách doanh nghiệp sẽ chủ động phản hồi trong thời gian sớm nhất.
            </p>
        </section>
    </div>
  `.trim()
};