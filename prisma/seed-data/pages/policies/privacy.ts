import { PageType, PolicyType } from "@prisma/client";
import { PageSeedData } from "../types";

export const privacyPolicy: PageSeedData = {
  title: "Chính sách bảo mật",
  slug: "bao-mat-thong-tin",
  type: PageType.POLICY,
  policyType: PolicyType.PRIVACY, // Phân loại là Chính sách bảo mật chung
  isPublished: true,
  priority: 8, // Độ ưu tiên hiển thị
//   metaTitle: "Chính sách bảo mật thông tin và giao dịch - ChoCongNghe",
//   metaDescription: "Tìm hiểu chi tiết cam kết của ChoCongNghe về việc bảo vệ quyền riêng tư, thông tin giao dịch và dữ liệu thẻ thanh toán của khách hàng.",
  content: `
    <div class="text-primary leading-relaxed mb-10 w-full">
        <h1 class="font-bold mb-5 text-primary text-center text-[24px]">
            Chính sách bảo mật
        </h1>

        <p class="leading-relaxed mb-6 text-primary">
            Shop cam kết sẽ bảo mật những thông tin mang tính riêng tư của bạn.
            Bạn vui lòng đọc bản "Chính sách bảo mật" dưới đây để hiểu hơn những
            cam kết mà chúng tôi thực hiện, nhằm tôn trọng và bảo vệ quyền lợi
            của người truy cập.
        </p>

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">1. Mục đích và phạm vi thu thập</h2>
            <p class="leading-relaxed mb-3 text-primary">
                Để truy cập và sử dụng một số dịch vụ tại, bạn có thể sẽ được yêu
                cầu đăng ký với chúng tôi thông tin cá nhân (Email, Họ tên, Số ĐT
                liên lạc…). Mọi thông tin khai báo phải đảm bảo tính chính xác và
                hợp pháp. Không chịu mọi trách nhiệm liên quan đến pháp luật của
                thông tin khai báo.
            </p>
            <p class="leading-relaxed mb-3 text-primary">
                Chúng tôi cũng có thể thu thập thông tin về số lần viếng thăm,
                bao gồm số trang bạn xem, số links (liên kết) bạn click và những
                thông tin khác liên quan đến việc kết nối đến site.
            </p>
            <p class="leading-relaxed text-primary">
                Chúng tôi cũng thu thập các thông tin mà trình duyệt Web
                (Browser) bạn sử dụng mỗi khi truy cập vào, bao gồm: địa chỉ IP,
                loại Browser, ngôn ngữ sử dụng, thời gian và những địa chỉ mà
                Browser truy xuất đến.
            </p>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">2. Phạm vi sử dụng thông tin</h2>
            <p class="leading-relaxed text-primary">
                Thu thập và sử dụng thông tin cá nhân bạn với mục đích phù hợp và
                hoàn toàn tuân thủ nội dung của "Chính sách bảo mật" này. Khi cần
                thiết, chúng tôi có thể sử dụng những thông tin này để liên hệ
                trực tiếp với bạn dưới các hình thức như: gởi thư ngỏ, đơn đặt
                hàng, thư cảm ơn, sms, thông tin về kỹ thuật và bảo mật…
            </p>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">3. Thời gian lưu trữ thông tin</h2>
            <p class="leading-relaxed text-primary">
                Dữ liệu cá nhân của Thành viên sẽ được lưu trữ cho đến khi có yêu
                cầu hủy bỏ hoặc tự thành viên đăng nhập và thực hiện hủy bỏ. Còn
                lại trong mọi trường hợp thông tin cá nhân thành viên sẽ được bảo
                mật.
            </p>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">4. Quy định bảo mật</h2>
            <p class="leading-relaxed mb-4 text-primary">
                Chính sách giao dịch thanh toán bằng thẻ quốc tế và thẻ nội địa
                (internet banking) đảm bảo tuân thủ các tiêu chuẩn bảo mật của
                các Đối Tác Cổng Thanh Toán:
            </p>
            <ul class="mb-5 space-y-2">
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Thông tin tài chính của Khách hàng sẽ được bảo vệ trong suốt quá trình giao dịch bằng giao thức SSL 256-bit (Secure Sockets Layer).</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Mật khẩu sử dụng một lần (OTP) được gửi qua SMS để đảm bảo việc truy cập tài khoản được xác thực.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Các nguyên tắc và quy định bảo mật thông tin trong ngành tài chính ngân hàng theo quy định của Ngân hàng nhà nước Việt Nam.</span>
                </li>
            </ul>
            <div class="rounded-lg p-4 mb-4 bg-neutral-light-active border border-neutral">
                <p class="font-semibold mb-2 text-primary">
                    Chính sách bảo mật giao dịch thanh toán áp dụng với Khách
                    hàng:
                </p>
                <ul class="space-y-2">
                    <li class="flex gap-2 leading-relaxed text-neutral-darker">
                        <span class="mt-1 shrink-0">•</span>
                        <span>Thông tin thẻ thanh toán của Khách hàng mà có khả năng sử dụng để xác lập giao dịch KHÔNG được lưu trên hệ thống của Shop. Đối Tác Cổng Thanh Toán sẽ lưu giữ và bảo mật theo tiêu chuẩn quốc tế PCI DSS.</span>
                    </li>
                    <li class="flex gap-2 leading-relaxed text-neutral-darker">
                        <span class="mt-1 shrink-0">•</span>
                        <span>Đối với thẻ nội địa (internet banking), Shop chỉ lưu trữ mã đơn hàng, mã giao dịch và tên ngân hàng.</span>
                    </li>
                    <li class="flex gap-2 leading-relaxed text-neutral-darker">
                        <span class="mt-1 shrink-0">•</span>
                        <span>Shop cam kết đảm bảo thực hiện nghiêm túc các biện pháp bảo mật cần thiết cho mọi hoạt động thanh toán thực hiện trên trang.</span>
                    </li>
                </ul>
            </div>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">5. Làm cách nào để yêu cầu xóa dữ liệu?</h2>
            <p class="leading-relaxed mb-3 text-primary">
                Bạn có thể gửi yêu cầu xóa dữ liệu qua hotline
                <strong>1800.6060</strong> hoặc <strong>1800.6626</strong> hoặc
                liên hệ trực tiếp tại cửa hàng ChoCongNghe gần nhất. Vui lòng
                cung cấp càng nhiều thông tin càng tốt về dữ liệu nào bạn muốn
                xóa.
            </p>
            <p class="leading-relaxed text-primary">
                Yêu cầu sẽ được chuyển đến nhóm thích hợp để đánh giá và xử lý.
                Chúng tôi sẽ liên hệ từng bước để cập nhật cho bạn về tiến trình
                xóa.
            </p>
        </section>
    </div>
  `.trim()
};