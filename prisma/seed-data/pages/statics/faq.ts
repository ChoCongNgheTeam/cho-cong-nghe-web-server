import { PageType } from "@prisma/client";
import { PageSeedData } from "../types";

export const faqPage: PageSeedData = {
  title: "Câu hỏi thường gặp",
  slug: "cau-hoi-thuong-gap",
  type: PageType.PAGE,
  policyType: null,
  isPublished: true,
  priority: 6, // Tiếp tục tăng số priority để trang nằm đúng thứ tự
//   metaTitle: "Câu hỏi thường gặp (FAQ) - Hỗ trợ mua hàng tại ChoCongNghe",
//   metaDescription: "Giải đáp các thắc mắc phổ biến về quy trình đặt hàng, thanh toán, giao hàng, bảo hành và đổi trả khi mua sắm tại hệ thống ChoCongNghe.",
  content: `
    <div class="text-primary leading-relaxed mb-10 w-full">
        <h1 class="text-[24px] font-bold text-primary text-center mb-7">
            Câu hỏi thường gặp
        </h1>
        <p class="mb-6 text-primary">
            Tổng hợp các câu hỏi phổ biến về mua hàng, thanh toán, giao hàng và
            bảo hành tại ChoCongNghe.
        </p>

        <section class="mb-6">
            <h2 class="font-bold text-primary mb-3">1. Mua hàng & đặt hàng</h2>
            <ul class="space-y-3">
                <li class="p-3 rounded-lg bg-neutral-light-active border border-neutral-light">
                    <p class="font-semibold text-primary mb-1">
                        Hỏi: Làm thế nào để đặt hàng online?
                    </p>
                    <p class="text-primary">Đáp: Bạn chọn sản phẩm, thêm vào giỏ hàng và tiến hành thanh toán theo hướng dẫn. Hệ thống sẽ gửi xác nhận sau khi đặt hàng thành công.</p>
                </li>
                <li class="p-3 rounded-lg bg-neutral-light-active border border-neutral-light">
                    <p class="font-semibold text-primary mb-1">
                        Hỏi: Tôi có thể thay đổi đơn hàng sau khi đặt không?
                    </p>
                    <p class="text-primary">Đáp: Bạn có thể liên hệ tổng đài hoặc chat với CSKH để hỗ trợ thay đổi thông tin đơn hàng trước khi đơn được giao cho đơn vị vận chuyển.</p>
                </li>
            </ul>
        </section>

        <section class="mb-6">
            <h2 class="font-bold text-primary mb-3">2. Thanh toán</h2>
            <ul class="space-y-3">
                <li class="p-3 rounded-lg bg-neutral-light-active border border-neutral-light">
                    <p class="font-semibold text-primary mb-1">
                        Hỏi: Có những phương thức thanh toán nào?
                    </p>
                    <p class="text-primary">Đáp: ChoCongNghe hỗ trợ COD, chuyển khoản, thẻ ngân hàng và các cổng thanh toán trực tuyến tùy theo thời điểm.</p>
                </li>
                <li class="p-3 rounded-lg bg-neutral-light-active border border-neutral-light">
                    <p class="font-semibold text-primary mb-1">
                        Hỏi: Thanh toán online có an toàn không?
                    </p>
                    <p class="text-primary">Đáp: Chúng tôi áp dụng các tiêu chuẩn bảo mật thông tin và chỉ làm việc với các cổng thanh toán uy tín.</p>
                </li>
            </ul>
        </section>

        <section class="mb-6">
            <h2 class="font-bold text-primary mb-3">3. Giao hàng</h2>
            <ul class="space-y-3">
                <li class="p-3 rounded-lg bg-neutral-light-active border border-neutral-light">
                    <p class="font-semibold text-primary mb-1">
                        Hỏi: Thời gian giao hàng dự kiến là bao lâu?
                    </p>
                    <p class="text-primary">Đáp: Thời gian giao hàng phụ thuộc khu vực và trạng thái kho. CSKH sẽ thông báo cụ thể khi xác nhận đơn.</p>
                </li>
                <li class="p-3 rounded-lg bg-neutral-light-active border border-neutral-light">
                    <p class="font-semibold text-primary mb-1">
                        Hỏi: Tôi có thể kiểm tra hàng trước khi nhận không?
                    </p>
                    <p class="text-primary">Đáp: Bạn có thể kiểm tra ngoại quan sản phẩm và phụ kiện theo chính sách hiện hành trước khi thanh toán.</p>
                </li>
            </ul>
        </section>

        <section class="mb-6">
            <h2 class="font-bold text-primary mb-3">4. Bảo hành & đổi trả</h2>
            <ul class="space-y-3">
                <li class="p-3 rounded-lg bg-neutral-light-active border border-neutral-light">
                    <p class="font-semibold text-primary mb-1">
                        Hỏi: Bảo hành bắt đầu từ khi nào?
                    </p>
                    <p class="text-primary">Đáp: Thời gian bảo hành được tính từ ngày xuất hóa đơn của đơn hàng.</p>
                </li>
                <li class="p-3 rounded-lg bg-neutral-light-active border border-neutral-light">
                    <p class="font-semibold text-primary mb-1">
                        Hỏi: Điều kiện đổi trả là gì?
                    </p>
                    <p class="text-primary">Đáp: Sản phẩm cần còn nguyên vẹn, đầy đủ phụ kiện và đáp ứng điều kiện đổi trả theo chính sách hiện hành.</p>
                </li>
            </ul>
        </section>

        <section class="mb-6">
            <h2 class="font-bold text-primary mb-3">5. Hóa đơn điện tử</h2>
            <ul class="space-y-3">
                <li class="p-3 rounded-lg bg-neutral-light-active border border-neutral-light">
                    <p class="font-semibold text-primary mb-1">
                        Hỏi: Tôi có thể tra cứu hóa đơn ở đâu?
                    </p>
                    <p class="text-primary">Đáp: Bạn có thể tra cứu tại trang Tra cứu hóa đơn điện tử bằng mã đơn hàng hoặc số điện thoại.</p>
                </li>
            </ul>
        </section>
    </div>
  `.trim()
};