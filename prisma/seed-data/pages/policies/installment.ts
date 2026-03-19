import { PageType, PolicyType } from "@prisma/client";
import { PageSeedData } from "../types";

export const installmentPolicy: PageSeedData = {
  title: "Chính sách trả góp",
  slug: "chinh-sach-tra-gop",
  type: PageType.POLICY,
  policyType: PolicyType.INSTALLMENT, // Phân loại là Chính sách trả góp
  isPublished: true,
  priority: 5, // Độ ưu tiên hiển thị
//   metaTitle: "Chính sách mua hàng trả góp linh hoạt - ChoCongNghe",
//   metaDescription: "Hướng dẫn chi tiết các hình thức mua hàng trả góp qua thẻ tín dụng, công ty tài chính, Kredivo và Home PayLater tại hệ thống ChoCongNghe với lãi suất ưu đãi.",
  content: `
    <div class="text-primary leading-relaxed mb-10 w-full">
        <h1 class="font-bold mb-5 text-primary text-center">
            Chính sách trả góp
        </h1>

        <p class="leading-relaxed mb-6 text-primary">
            Nhằm mang tới sự thuận tiện trong quá trình mua hàng, giúp Quý khách nhanh chóng sở hữu sản phẩm mong muốn, đi kèm với đó là các chương trình hấp dẫn. CHOCONGNGHE cung cấp dịch vụ trả góp đa dạng, dễ dàng tiếp cận, trong đó bao gồm trả góp qua thẻ tín dụng, trả góp qua Kredivo, trả góp qua Home PayLater và trả góp qua Công ty tài chính.
        </p>

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">1. Trả góp qua thẻ tín dụng</h2>
            <ul class="mb-5 space-y-2">
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Hiệu lực còn lại của thẻ phải lớn hơn kỳ hạn trả góp, riêng MB, Kiên Long Bank thì hiệu lực của thẻ phải lớn hơn kỳ hạn trả góp ít nhất (01) tháng.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Số dư thẻ phải lớn hơn hoặc bằng tổng giá trị trả góp.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Khách hàng phải nhập đúng số thẻ, ngày hết hạn và số CVV khi thực hiện giao dịch.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Thời gian trả góp 3, 6, 9, 12, 15, 18, 24, 36 tháng (tuỳ từng ngân hàng).</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Số lần mua trả góp tuỳ thuộc vào hạn mức thẻ tín dụng.</span>
                </li>
            </ul>

            <p class="font-semibold mb-3 text-primary">
                Giá trị thanh toán phải đạt số tiền trả góp tối thiểu:
            </p>
            <div class="space-y-2 mb-5">
                <div class="flex items-center gap-3 rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
                    <span class="font-bold px-2.5 py-1 rounded-full shrink-0 bg-accent-light text-accent">Từ 500.000đ</span>
                    <span class="text-primary">Muadee by HDBank</span>
                </div>
                <div class="flex items-center gap-3 rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
                    <span class="font-bold px-2.5 py-1 rounded-full shrink-0 bg-accent-light text-accent">Từ 1.000.000đ</span>
                    <span class="text-primary">NCB, Sacombank</span>
                </div>
                <div class="flex items-center gap-3 rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
                    <span class="font-bold px-2.5 py-1 rounded-full shrink-0 bg-accent-light text-accent">Từ 2.000.000đ</span>
                    <span class="text-primary">Techcombank, VIB, Home Credit và Lotte Finance</span>
                </div>
                <div class="flex items-center gap-3 rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
                    <span class="font-bold px-2.5 py-1 rounded-full shrink-0 bg-accent-light text-accent">Từ 3.000.000đ</span>
                    <span class="text-primary">Các ngân hàng còn lại</span>
                </div>
            </div>

            <p class="font-semibold mb-3 text-primary">
                Ngân hàng – Cách thức chuyển đổi trả góp:
            </p>
            <div class="space-y-3 mb-5">
                <div class="rounded-lg p-4 bg-neutral-light-active border border-neutral">
                    <p class="font-semibold mb-1.5 text-neutral-darker">Vietcombank, MB, SHB, LPBank, HDBank, PVcomBank, TPBank, Shinhan Finance (SVFC), Mcredit, Woori Bank, Lotte Finance, Home Credit, Standard Chartered, Vietbank</p>
                    <p class="leading-relaxed text-primary">→ Ngân hàng sẽ không hỗ trợ chuyển đổi trả góp sau khi giao dịch đã lên sao kê.</p>
                </div>
                <div class="rounded-lg p-4 bg-neutral-light-active border border-neutral">
                    <p class="font-semibold mb-1.5 text-neutral-darker">Các ngân hàng còn lại</p>
                    <p class="leading-relaxed text-primary">→ Sau 7 - 10 ngày làm việc hệ thống tự chuyển đổi. Trường hợp trong thời gian chờ chuyển đổi mà tài khoản của Quý khách đã lên sao kê thì khi thanh toán với ngân hàng Quý khách hãy trừ khoản thanh toán này ra. Một số ngân hàng hỗ trợ chuyển đổi sau kỳ sao kê, thời gian cụ thể sẽ phụ thuộc vào chính sách của từng ngân hàng.</p>
                </div>
            </div>

            <div class="rounded-lg p-4 bg-neutral-light-active border border-neutral">
                <p class="font-semibold mb-2 text-primary">Lưu ý</p>
                <ul class="space-y-2">
                    <li class="flex gap-2 leading-relaxed text-neutral-darker">
                        <span class="mt-1 shrink-0">•</span>
                        <span>Không nên giao dịch cận ngày sao kê. Đối với riêng các ngân hàng bao gồm Vietcombank, MB, SHB, LPBank, HDBank, PVcomBank, TPBank, Shinhan Finance (SVFC), Mcredit, Woori Bank, Lotte Finance, Home Credit, Standard Chartered, Vietbank, Ngân Lượng sẽ khoá trên hệ thống các ngày gần sao kê tuỳ theo từng ngân hàng và loại thẻ.</span>
                    </li>
                    <li class="flex gap-2 leading-relaxed text-neutral-darker">
                        <span class="mt-1 shrink-0">•</span>
                        <span>Trong thời gian đó chủ thẻ vui lòng sử dụng thẻ của các ngân hàng còn lại để thực hiện giao dịch trả góp.</span>
                    </li>
                    <li class="flex gap-2 leading-relaxed text-neutral-darker">
                        <span class="mt-1 shrink-0">•</span>
                        <span>Chương trình không áp dụng cho thẻ phụ, thẻ Debit và thẻ tín dụng phát hành tại nước ngoài.</span>
                    </li>
                </ul>
            </div>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">2. Trả góp qua nhà tài chính</h2>
            <p class="leading-relaxed mb-5 text-primary">
                Khách hàng mang hồ sơ được yêu cầu tới CHOCONGNGHE gần nhất để đăng ký và hoàn tất thủ tục trả góp qua nhà tài chính.
            </p>
            <div class="rounded-lg overflow-hidden border border-neutral">
                <div class="grid grid-cols-4 font-semibold px-4 py-2.5 bg-neutral-light-active border-b border-neutral text-primary">
                    <span>Công ty tài chính</span>
                    <span>Độ tuổi</span>
                    <span>Hồ sơ</span>
                    <span>Yêu cầu khác</span>
                </div>
                <div class="grid grid-cols-4 px-4 py-3 gap-2 text-primary">
                    <div class="space-y-1">
                        <span class="block font-semibold text-accent">HDS</span>
                        <span class="block font-semibold text-accent">HOME CREDIT</span>
                        <span class="block font-semibold text-accent">SHINHAN FINANCE</span>
                        <span class="block font-semibold text-accent">FE CREDIT</span>
                        <span class="block font-semibold text-accent">MIRAE ASSET</span>
                        <span class="block font-semibold text-accent">SAMSUNG FINANCE PLUS</span>
                    </div>
                    <div class="space-y-1">
                        <span class="block">18 - 60</span>
                        <span class="block">18 - 60</span>
                        <span class="block">Nam: 21 - 60 / Nữ: 18 - 60</span>
                        <span class="block">18 - 60</span>
                    </div>
                    <ul class="space-y-1">
                        <li class="flex gap-1 text-primary">
                            <span class="shrink-0">•</span><span>Căn cước/CMND</span>
                        </li>
                        <li class="flex gap-1 text-primary">
                            <span class="shrink-0">•</span><span>Bằng lái xe / Sổ hộ khẩu</span>
                        </li>
                        <li class="flex gap-1 text-primary">
                            <span class="shrink-0">•</span><span>Email</span>
                        </li>
                        <li class="flex gap-1 text-primary">
                            <span class="shrink-0">•</span><span>SIM chính chủ</span>
                        </li>
                    </ul>
                    <ul class="space-y-1">
                        <li class="flex gap-1 text-primary">
                            <span class="shrink-0">•</span><span>Hồ sơ được đơn vị trả góp duyệt</span>
                        </li>
                        <li class="flex gap-1 text-primary">
                            <span class="shrink-0">•</span><span>Thu nhập từ 4.000.000 VNĐ/tháng</span>
                        </li>
                        <li class="flex gap-1 text-primary">
                            <span class="shrink-0">•</span><span>Có tài khoản Kredivo</span>
                        </li>
                    </ul>
                </div>
            </div>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">3. Trả góp qua Kredivo</h2>
            <div class="rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
                <p class="italic text-neutral-darker">Chính sách đang được cập nhật.</p>
            </div>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">4. Trả góp qua Home PayLater</h2>
            <div class="rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
                <p class="italic text-neutral-darker">Chính sách đang được cập nhật.</p>
            </div>
        </section>
    </div>
  `.trim()
};