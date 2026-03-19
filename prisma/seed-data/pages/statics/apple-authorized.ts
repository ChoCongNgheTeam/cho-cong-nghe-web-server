import { PageType } from "@prisma/client";
import { PageSeedData } from "../types";

export const appleAuthorizedPage: PageSeedData = {
  title: "Đại lý ủy quyền và TTBH ủy quyền của Apple",
  slug: "dai-ly-uy-quyen-apple",
  type: PageType.PAGE, // Đổi thành PAGE
  policyType: null,    // Trang tĩnh nên policyType là null
  isPublished: true,
  priority: 3, // Thứ tự hiển thị trong danh sách trang tĩnh
//   metaTitle: "Đại lý và Trung tâm bảo hành ủy quyền Apple - ChoCongNghe",
//   metaDescription: "Danh sách và hướng dẫn nhận biết đại lý ủy quyền, trung tâm bảo hành chính thức của Apple. Quy trình tiếp nhận và dịch vụ bảo hành tại ChoCongNghe.",
  content: `
    <div class="text-primary leading-relaxed mb-10 w-full">
        <h1 class="text-[24px] font-bold text-primary text-center mb-7">
            Đại lý ủy quyền và TTBH ủy quyền của Apple
        </h1>

        <section class="mb-6">
            <h2 class="font-bold text-primary mb-2">1. Thông tin chung</h2>
            <p class="text-primary">
                Trang này cung cấp thông tin tham khảo về các điểm bán và trung tâm
                bảo hành ủy quyền. Danh sách chi tiết sẽ được cập nhật định kỳ để
                đảm bảo độ chính xác.
            </p>
        </section>

        <section class="mb-6">
            <h2 class="font-bold text-primary mb-2">2. Cách nhận biết</h2>
            <ul class="space-y-2">
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p class="text-primary">Niêm yết thông tin đơn vị ủy quyền rõ ràng tại cửa hàng hoặc trên website.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p class="text-primary">Có khu vực tiếp nhận bảo hành và quy trình xử lý minh bạch.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p class="text-primary">Xuất hóa đơn và phiếu tiếp nhận bảo hành theo đúng quy định.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p class="text-primary">Tư vấn đúng chính sách bảo hành của hãng và hỗ trợ kiểm tra tình trạng.</p>
                </li>
            </ul>
        </section>

        <section class="mb-6">
            <h2 class="font-bold text-primary mb-2">
                3. Dịch vụ tại TTBH ủy quyền
            </h2>
            <ul class="space-y-2">
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p class="text-primary">Tiếp nhận và kiểm tra tình trạng thiết bị.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p class="text-primary">Tư vấn quy trình bảo hành và thời gian dự kiến.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p class="text-primary">Bảo hành theo tiêu chuẩn của hãng (đối với sản phẩm đủ điều kiện).</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p class="text-primary">Hỗ trợ cập nhật tiến độ và bàn giao sau khi hoàn tất.</p>
                </li>
            </ul>
        </section>

        <section>
            <h2 class="font-bold text-primary mb-2">4. Lưu ý khi đến bảo hành</h2>
            <p class="text-primary">
                Quý khách vui lòng mang theo hóa đơn, phụ kiện đi kèm (nếu có) và
                sao lưu dữ liệu trước khi gửi bảo hành. Tình trạng tiếp nhận sẽ
                được xác định dựa trên kiểm tra thực tế tại trung tâm.
            </p>
        </section>
    </div>
  `.trim()
};