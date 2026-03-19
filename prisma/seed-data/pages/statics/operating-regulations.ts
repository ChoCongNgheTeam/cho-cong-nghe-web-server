import { PageType } from "@prisma/client";
import { PageSeedData } from "../types";

export const operatingRegulationsPage: PageSeedData = {
  title: "Quy chế Hoạt động",
  slug: "quy-che-hoat-dong",
  type: PageType.PAGE, // Đổi thành PAGE
  policyType: null,    // Đổi thành null
  isPublished: true,
  priority: 7, // Cài đặt độ ưu tiên hiển thị trong nhóm trang tĩnh
//   metaTitle: "Quy chế Hoạt động - Điều khoản mua bán tại ChoCongNghe Shop",
//   metaDescription: "Quy chế hoạt động chính thức của ChoCongNghe Shop, bao gồm các quy định về đăng ký tài khoản, quy trình mua hàng, thanh toán, bảo mật và trách nhiệm người dùng.",
  content: `
    <div class="text-primary leading-relaxed mb-10 w-full">
        <h1 class="text-[1.385em] font-bold text-primary text-center mb-7">
            Quy chế Hoạt động của ChoCongNghe Shop
        </h1>

        <section class="mb-6">
            <h2 class="font-bold text-primary mb-2">1. Mục đích và Phạm vi Hoạt động</h2>
            <p>
                ChoCongNghe Shop cung cấp các sản phẩm công nghệ chính hãng như
                điện thoại di động, máy tính bảng, laptop, phụ kiện và các mặt
                hàng điện máy, gia dụng. Website được xây dựng nhằm hỗ trợ khách
                hàng tìm kiếm thông tin sản phẩm, đặt hàng trực tuyến và sử dụng
                các dịch vụ hậu mãi một cách thuận tiện và nhanh chóng.
            </p>
        </section>

        <section class="mb-6">
            <h2 class="font-bold text-primary mb-2">2. Đăng ký Tài khoản</h2>
            <ul class="space-y-2">
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p>Người dùng có thể đăng ký tài khoản để thực hiện các giao dịch mua sắm và sử dụng đầy đủ tiện ích trên website.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p>Thông tin cá nhân cung cấp phải chính xác, đầy đủ và được cập nhật khi có thay đổi.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p>Người dùng chịu trách nhiệm bảo mật thông tin đăng nhập của mình.</p>
                </li>
            </ul>
        </section>

        <section class="mb-6">
            <h2 class="font-bold text-primary mb-2">3. Quy trình Mua hàng</h2>
            <p class="mb-3">Khách hàng có thể thực hiện mua sắm theo các bước:</p>
            <ol class="space-y-2 mb-4">
                <li class="flex gap-2.5">
                    <span class="shrink-0 font-semibold text-accent">1.</span>
                    <p>Duyệt và lựa chọn sản phẩm.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="shrink-0 font-semibold text-accent">2.</span>
                    <p>Thêm sản phẩm vào giỏ hàng.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="shrink-0 font-semibold text-accent">3.</span>
                    <p>Điền thông tin nhận hàng.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="shrink-0 font-semibold text-accent">4.</span>
                    <p>Chọn phương thức thanh toán và xác nhận đơn hàng.</p>
                </li>
            </ol>
            <p class="mb-3">Các hình thức thanh toán có thể bao gồm:</p>
            <ul class="space-y-2">
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p>Thanh toán khi nhận hàng (COD)</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p>Chuyển khoản ngân hàng</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p>Thanh toán qua cổng thanh toán trực tuyến (nếu có)</p>
                </li>
            </ul>
        </section>

        <section class="mb-6">
            <h2 class="font-bold text-primary mb-2">4. Chính sách Hoàn trả và Đổi hàng</h2>
            <ul class="space-y-2">
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p>Khách hàng có quyền yêu cầu đổi hoặc trả sản phẩm theo chính sách hiện hành của ChoCongNghe Shop.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p>Sản phẩm được chấp nhận đổi/trả khi còn nguyên vẹn, đầy đủ phụ kiện và trong thời gian quy định.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p>Trường hợp sản phẩm lỗi kỹ thuật, ChoCongNghe Shop sẽ hỗ trợ xử lý theo chính sách bảo hành.</p>
                </li>
            </ul>
        </section>

        <section class="mb-6">
            <h2 class="font-bold text-primary mb-2">5. Bảo mật Thông tin</h2>
            <p class="mb-3">
                ChoCongNghe Shop cam kết bảo mật thông tin cá nhân của khách hàng
                theo quy định pháp luật. Các biện pháp bảo mật bao gồm nhưng
                không giới hạn:
            </p>
            <ul class="space-y-2 mb-3">
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p>Mã hóa dữ liệu</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p>Kiểm soát truy cập hệ thống</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p>Bảo vệ thông tin thanh toán</p>
                </li>
            </ul>
            <p>Thông tin khách hàng chỉ được sử dụng nhằm mục đích phục vụ giao dịch và nâng cao chất lượng dịch vụ.</p>
        </section>

        <section class="mb-6">
            <h2 class="font-bold text-primary mb-2">6. Hỗ trợ Khách hàng</h2>
            <p class="mb-3">ChoCongNghe Shop cung cấp các kênh hỗ trợ:</p>
            <ul class="space-y-2 mb-3">
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p>Email chăm sóc khách hàng</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p>Hotline</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p>Chat trực tuyến trên website</p>
                </li>
            </ul>
            <p>Ngoài ra, website có thể cung cấp tài liệu hướng dẫn và nội dung hỗ trợ sử dụng sản phẩm khi cần thiết.</p>
        </section>

        <section class="mb-6">
            <h2 class="font-bold text-primary mb-3">7. Quyền và Nghĩa vụ của Người dùng</h2>
            <p class="font-semibold text-primary mb-2">Quyền của người dùng:</p>
            <ul class="space-y-2 mb-4">
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p>Được mua và sử dụng sản phẩm hợp pháp</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p>Được hỗ trợ theo chính sách của ChoCongNghe Shop</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p>Được bảo mật thông tin cá nhân</p>
                </li>
            </ul>
            <p class="font-semibold text-primary mb-2">Nghĩa vụ của người dùng:</p>
            <ul class="space-y-2">
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p>Cung cấp thông tin trung thực</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p>Tuân thủ quy định của website</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p>Không sử dụng website cho mục đích gian lận hoặc trái pháp luật</p>
                </li>
            </ul>
        </section>

        <section class="mb-6">
            <h2 class="font-bold text-primary mb-2">8. Điều khoản Sử dụng</h2>
            <p>
                Mọi nội dung trên website, bao gồm hình ảnh, văn bản, thiết kế và
                thương hiệu, đều thuộc quyền sở hữu của ChoCongNghe Shop hoặc đối
                tác hợp pháp. Nghiêm cấm sao chép, phát tán hoặc sử dụng cho mục
                đích thương mại khi chưa được cho phép bằng văn bản.
            </p>
        </section>

        <section class="mb-6">
            <h2 class="font-bold text-primary mb-2">9. Thay đổi Quy chế</h2>
            <p>
                ChoCongNghe Shop có quyền điều chỉnh, cập nhật Quy chế hoạt động
                bất cứ lúc nào nhằm phù hợp với tình hình thực tế và quy định
                pháp luật. Các thay đổi sẽ được thông báo trên website và có hiệu
                lực kể từ thời điểm đăng tải.
            </p>
        </section>

        <section>
            <h2 class="font-bold text-primary mb-3">10. Liên hệ</h2>
            <p class="mb-3">
                Mọi thắc mắc hoặc phản hồi, khách hàng vui lòng liên hệ
                ChoCongNghe Shop qua:
            </p>
            <ul class="space-y-2">
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p><span class="font-semibold text-primary">Hotline:</span> (cập nhật)</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p><span class="font-semibold text-primary">Email:</span> (cập nhật)</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p><span class="font-semibold text-primary">Địa chỉ:</span> (cập nhật)</p>
                </li>
            </ul>
        </section>
    </div>
  `.trim()
};