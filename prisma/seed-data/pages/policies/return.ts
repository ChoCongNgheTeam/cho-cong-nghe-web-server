import { PageType, PolicyType } from "@prisma/client";
import { PageSeedData } from "../types";

export const returnPolicy: PageSeedData = {
  title: "Chính sách đổi trả",
  slug: "chinh-sach-doi-tra",
  type: PageType.POLICY,
  policyType: PolicyType.RETURN, // Phân loại là Chính sách đổi trả
  isPublished: true,
  priority: 9, // Độ ưu tiên hiển thị
//   metaTitle: "Chính sách đổi trả và hoàn tiền nhanh chóng - ChoCongNghe",
//   metaDescription: "Tìm hiểu chi tiết các điều kiện, thời gian và quy trình đổi trả hàng hóa, hoàn tiền tại hệ thống ChoCongNghe để đảm bảo quyền lợi khi mua sắm.",
  content: `
    <div class="text-primary leading-relaxed mb-10 w-full">
        <h1 class="font-bold mb-6 text-primary text-center text-[24px]">
            Chính sách đổi trả
        </h1>

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">Khung chính sách đổi trả</h2>
            <p class="leading-relaxed mb-3 text-primary">
                ChoCongNghe cung cấp các hướng dẫn thiết yếu cho việc tạo chính
                sách hoàn tiền và đổi trả hiệu quả, bao gồm các chủ đề như tầm
                quan trọng của việc có chính sách rõ ràng, ghi chú về các sản
                phẩm có thể hoặc không thể hoàn tiền, quyết định ai sẽ trả phí
                vận chuyển đổi trả, và thiết lập kỳ vọng của khách hàng về thời
                gian hoàn tiền.
            </p>
            <p class="leading-relaxed mb-3 text-primary">
                Tính năng quản lý RMA (Return Merchandise Authorization): Việc
                thêm chính sách bảo hành và đổi trả vừa đơn giản vừa phức tạp. Hệ
                thống quản lý quy trình RMA, thêm bảo hành cho sản phẩm, và cho
                phép khách hàng yêu cầu và quản lý đổi trả/hoàn tiền từ tài khoản
                của họ.
            </p>

            <div class="mt-4 space-y-4">
                <div class="pl-4 border-l-[3px] border-accent">
                    <p class="font-semibold mb-1 text-primary">1. Thời gian đổi trả</p>
                    <p class="leading-relaxed text-primary">
                        Thiết lập số ngày tối đa cho phép đổi trả và chọn trạng
                        thái đơn hàng mà chính sách RMA được áp dụng.
                    </p>
                </div>
                <div class="pl-4 border-l-[3px] border-accent">
                    <p class="font-semibold mb-1 text-primary">2. Quy trình đổi trả</p>
                    <p class="leading-relaxed text-primary">
                        Quản lý quy trình hoàn tiền trong cửa hàng một cách dễ
                        dàng. Kích hoạt biểu mẫu hoàn tiền, cho phép đổi trả tự
                        động, tắt biểu mẫu hoàn tiền sau một thời gian cụ thể, và
                        quản lý hoàn tiền trực tiếp từ đơn hàng.
                    </p>
                </div>
                <div class="pl-4 border-l-[3px] border-accent">
                    <p class="font-semibold mb-1 text-primary">3. Yêu cầu đổi trả không cần đăng nhập</p>
                    <p class="leading-relaxed text-primary">
                        Tính năng mới cho phép khách hàng yêu cầu hoàn tiền mà
                        không cần đăng nhập tài khoản.
                    </p>
                </div>
            </div>

            <div class="mt-5 rounded-lg p-4 bg-neutral-light-active border border-neutral">
                <p class="font-semibold mb-2 text-primary">
                    Chính sách bảo hành điển hình — Sản phẩm điện tử
                </p>
                <p class="leading-relaxed text-neutral-darker">
                    Đa số sản phẩm có bảo hành của nhà sản xuất 
                    <strong class="text-primary">1 năm</strong>. Bảo hành mở
                    rộng có sẵn cho hầu hết các sản phẩm với mức phí nhỏ.
                </p>
            </div>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">Điều kiện bảo hành</h2>
            <p class="leading-relaxed text-primary">
                Chúng tôi sẽ chấp nhận đổi trả bất kỳ sản phẩm mới chưa qua sử
                dụng của đại lý nếu sản phẩm không hoạt động do lỗi vật liệu hoặc
                lỗi sản xuất trong thời gian <strong>một năm</strong> kể từ ngày
                mua.
            </p>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">Thời gian đổi trả phổ biến</h2>
            <div class="space-y-2">
                <div class="flex items-center gap-3 rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
                    <span class="font-bold px-2.5 py-1 rounded-full shrink-0 bg-accent-light text-accent">7 – 14 ngày</span>
                    <span class="text-primary">Đổi trả do không hài lòng</span>
                </div>
                <div class="flex items-center gap-3 rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
                    <span class="font-bold px-2.5 py-1 rounded-full shrink-0 bg-accent-light text-accent">30 ngày</span>
                    <span class="text-primary">Đổi trả do lỗi sản phẩm</span>
                </div>
                <div class="flex items-center gap-3 rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
                    <span class="font-bold px-2.5 py-1 rounded-full shrink-0 bg-accent-light text-accent">1 năm</span>
                    <span class="text-primary">Bảo hành chính hãng</span>
                </div>
            </div>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">Điều kiện đổi trả</h2>
            <ul class="space-y-2">
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent-light text-accent">✓</span>
                    Sản phẩm còn nguyên vẹn, chưa qua sử dụng
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent-light text-accent">✓</span>
                    Có đầy đủ phụ kiện, hộp, sách hướng dẫn
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent-light text-accent">✓</span>
                    Tem bảo hành còn nguyên vẹn
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent-light text-accent">✓</span>
                    Có hóa đơn mua hàng
                </li>
            </ul>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">Quy trình đổi trả</h2>
            <ol class="space-y-3">
                <li class="flex items-center gap-3 text-primary">
                    <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent text-white">1</span>
                    Khách hàng tạo yêu cầu đổi trả
                    <span class="ml-auto text-neutral-dark">→</span>
                </li>
                <li class="flex items-center gap-3 text-primary">
                    <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent text-white">2</span>
                    Cung cấp lý do đổi trả
                    <span class="ml-auto text-neutral-dark">→</span>
                </li>
                <li class="flex items-center gap-3 text-primary">
                    <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent text-white">3</span>
                    Đóng gói và gửi sản phẩm
                    <span class="ml-auto text-neutral-dark">→</span>
                </li>
                <li class="flex items-center gap-3 text-primary">
                    <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent text-white">4</span>
                    Kiểm tra sản phẩm
                    <span class="ml-auto text-neutral-dark">→</span>
                </li>
                <li class="flex items-center gap-3 text-primary">
                    <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent text-white">5</span>
                    Xử lý đổi trả / hoàn tiền
                </li>
            </ol>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">Phí đổi trả</h2>
            <div class="space-y-2">
                <div class="flex items-center justify-between rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
                    <span class="text-primary">Lỗi do nhà sản xuất</span>
                    <span class="font-semibold text-accent">Miễn phí</span>
                </div>
                <div class="flex items-center justify-between rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
                    <span class="text-primary">Khách hàng đổi ý</span>
                    <span class="font-semibold text-neutral-darker">Khách hàng chịu phí vận chuyển</span>
                </div>
                <div class="flex items-center justify-between rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
                    <span class="text-primary">Đổi size / mẫu</span>
                    <span class="font-semibold text-neutral-darker">Tùy chính sách cụ thể</span>
                </div>
            </div>
            <p class="mt-4 leading-relaxed text-neutral-darker">
                Quy trình hoàn tiền và đổi trả được thực hiện đơn giản. Khách hàng có thể liên hệ hotline <strong class="text-primary">1800.6060</strong> hoặc <strong class="text-primary">1800.6626</strong> để được hỗ trợ trực tiếp.
            </p>
        </section>
    </div>
  `.trim()
};