import { PageType } from "@prisma/client";
import { PageSeedData } from "../types";

export const warrantyLookupPage: PageSeedData = {
  title: "Tra cứu bảo hành",
  slug: "tra-cuu-bao-hanh",
  type: PageType.PAGE,
  policyType: null,
  isPublished: true,
  priority: 9, // Tiếp tục tăng priority để xếp sau các trang trước
//   metaTitle: "Tra cứu thông tin bảo hành thiết bị - ChoCongNghe",
//   metaDescription: "Hướng dẫn chi tiết các bước và thông tin cần thiết để tra cứu tình trạng bảo hành của điện thoại, laptop, thiết bị thông minh mua tại ChoCongNghe.",
  content: `
    <div class="text-primary leading-relaxed mb-10 w-full">
        <h1 class="text-[24px] font-bold text-primary text-center mb-7">
            Tra cứu bảo hành
        </h1>

        <section class="mb-6">
            <h2 class="font-bold text-primary mb-2">1. Thông tin cần chuẩn bị</h2>
            <ul class="space-y-2">
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p class="text-primary">Số IMEI/Serial của sản phẩm.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p class="text-primary">Mã đơn hàng hoặc số hóa đơn mua hàng.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p class="text-primary">Số điện thoại đặt hàng hoặc email nhận thông báo.</p>
                </li>
            </ul>
        </section>

        <section class="mb-6">
            <h2 class="font-bold text-primary mb-2">2. Cách tra cứu</h2>
            <ul class="space-y-2">
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p class="text-primary">Tra cứu trực tuyến tại cổng hỗ trợ (đang cập nhật).</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p class="text-primary">Liên hệ tổng đài CSKH để được hỗ trợ kiểm tra.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p class="text-primary">Đến trực tiếp cửa hàng gần nhất để được hỗ trợ.</p>
                </li>
            </ul>
        </section>

        <section class="mb-6">
            <h2 class="font-bold text-primary mb-2">
                3. Trạng thái bảo hành thường gặp
            </h2>
            <ul class="space-y-2">
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p class="text-primary">Trong thời hạn bảo hành.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p class="text-primary">Hết thời hạn bảo hành.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p class="text-primary">Đang xử lý tại trung tâm bảo hành.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p class="text-primary">Chờ linh kiện hoặc hẹn trả máy.</p>
                </li>
            </ul>
        </section>

        <section>
            <h2 class="font-bold text-primary mb-2">4. Lưu ý</h2>
            <p class="text-primary">
                Thời hạn bảo hành được tính từ ngày xuất hóa đơn. Điều kiện và
                thời gian xử lý phụ thuộc chính sách của từng hãng và tình trạng
                thực tế của thiết bị.
            </p>
        </section>
    </div>
  `.trim()
};
