import { PageType, PolicyType } from "@prisma/client";
import { PageSeedData } from "../types";

export const loyaltyPolicy: PageSeedData = {
  title: "Chính sách Chương trình Khách hàng thân thiết",
  slug: "khach-hang-than-thiet",
  type: PageType.POLICY,
  policyType: PolicyType.LOYALTY, // Phân loại là Khách hàng thân thiết
  isPublished: true,
  priority: 6, // Độ ưu tiên hiển thị
//   metaTitle: "Chính sách Chương trình Khách hàng thân thiết tại ChoCongNghe",
//   metaDescription: "Tham gia chương trình Khách hàng thân thiết tại ChoCongNghe để tích điểm, đổi voucher giảm giá và nhận các suất mua đặc quyền hấp dẫn.",
  content: `
    <div class="text-primary leading-relaxed mb-10 w-full">
        <h1 class="font-bold mb-5 text-primary text-center">
            Chính sách Chương trình Khách hàng thân thiết tại ChoCongNghe
        </h1>

        <p class="leading-relaxed mb-6 text-primary">
            Khách hàng khi mua hàng tại hệ sinh thái ChoCongNghe sẽ được tích
            lũy điểm và đổi thành ưu đãi.
        </p>

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">1. Tổng quan</h2>
            <p class="leading-relaxed mb-3 text-primary">
                "Chương trình khách hàng thân thiết" là chương trình ưu đãi dành
                riêng cho Khách hàng thân thiết của chuỗi cửa hàng trực thuộc
                ChoCongNghe bao gồm:
            </p>
            <ul class="space-y-2">
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Chuỗi cửa hàng ChoCongNghe</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Chuỗi cửa hàng thương hiệu (F.Studio, S.Studio, Garmin...)</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Công ty Cổ phần Dược phẩm FPT Long Châu</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Tiêm chủng Long Châu</span>
                </li>
            </ul>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">2. Đối tượng áp dụng</h2>
            <p class="leading-relaxed text-primary">
                Chỉ áp dụng cho các khách hàng cá nhân, không áp dụng cho khách
                hàng bán buôn hoặc mua số lượng lớn phục vụ cho doanh nghiệp hoặc
                đơn hàng nằm trong chương trình ưu đãi dành riêng cho đối tác/dự
                án/xuất hoá đơn công ty.
            </p>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">3. Phạm vi áp dụng</h2>
            <p class="leading-relaxed mb-3 text-primary">
                Áp dụng cho khách hàng mua hàng trực tiếp tại hệ thống cửa hàng
                hoặc trên các kênh bán hàng trực tuyến chính thức của chuỗi cửa
                hàng trực thuộc ChoCongNghe bao gồm:
            </p>
            <ul class="space-y-2">
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Chuỗi cửa hàng ChoCongNghe</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Chuỗi cửa hàng thương hiệu (F.Studio, S.Studio, Garmin...)</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Công ty Cổ phần Dược phẩm FPT Long Châu</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Tiêm chủng Long Châu</span>
                </li>
            </ul>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">4. Thời gian diễn ra chương trình</h2>
            <div class="rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
                <p class="text-primary">
                    Từ ngày <strong>05/01/2024</strong>
                    <span class="text-neutral-darker ml-2">
                        (*) Có thể thay đổi và sẽ cập nhật khi đang diễn ra chương trình.
                    </span>
                </p>
            </div>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">5. Chi tiết cách thức và thể lệ tham gia chương trình tại ChoCongNghe</h2>
            <p class="font-semibold mb-3 text-primary">5.1. Thể lệ</p>
            <ul class="space-y-3 mb-5">
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Điểm thưởng được tích lũy dựa trên giá trị hóa đơn hàng hóa/dịch vụ của hệ thống bán lẻ ChoCongNghe (không bao gồm các dịch vụ thu hộ, dịch vụ ChoCongNghe bán hàng thay cho đối tác không ghi nhận doanh thu trực tiếp ChoCongNghe, đơn hàng nằm trong chương trình ưu đãi dành riêng cho đối tác/dự án/xuất hoá đơn công ty).</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Cứ mỗi <strong>4.000 đồng</strong> trên hóa đơn thanh toán, khách hàng sẽ được tích <strong>01 điểm thưởng</strong>. Số điểm thưởng được tích sẽ dựa vào giá trị cuối cùng của hóa đơn khách hàng thanh toán. <span class="text-neutral-darker">Ví dụ: Giá trị đơn hàng là 500.000đ, khách hàng áp dụng mã khuyến mãi 100.000đ → giá trị thanh toán 400.000đ → được tích 100 điểm.</span></span>
                </li>
            </ul>

            <p class="font-semibold mb-3 text-primary">
                Từ ngày 01/11/2024, khách hàng có thể quy đổi điểm thưởng thành
                ưu đãi giảm giá:
            </p>
            <div class="space-y-2 mb-5">
                <div class="flex items-center gap-3 rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
                    <span class="font-bold px-2.5 py-1 rounded-full shrink-0 bg-accent-light text-accent">Đơn dưới 1.000.000đ</span>
                    <span class="text-primary">Giảm tối đa 200.000đ (tương đương 20.000 điểm)</span>
                </div>
                <div class="flex items-center gap-3 rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
                    <span class="font-bold px-2.5 py-1 rounded-full shrink-0 bg-accent-light text-accent">Đơn từ 1.000.000đ trở lên</span>
                    <span class="text-primary">Quy đổi tối đa 20% giá trị đơn hàng</span>
                </div>
            </div>

            <div class="rounded-lg p-4 bg-neutral-light-active border border-neutral mb-6">
                <p class="font-semibold mb-2 text-primary">
                    Ưu đãi được nhận khi tích đủ điểm
                </p>
                <ul class="space-y-2">
                    <li class="flex gap-2 leading-relaxed text-neutral-darker">
                        <span class="mt-1 shrink-0">•</span>
                        <span>Khách hàng cần đổi tối thiểu từ 50 điểm để có thể quy đổi thành Voucher. 1 điểm thưởng = 10 đồng.</span>
                    </li>
                    <li class="flex gap-2 leading-relaxed text-neutral-darker">
                        <span class="mt-1 shrink-0">•</span>
                        <span>Khi tích đủ mức điểm, khách hàng có thể đổi suất mua đặc quyền với giá 1.000đ theo 4 mốc điểm: 1.000 / 3.000 / 8.000 / 15.000 điểm.</span>
                    </li>
                    <li class="flex gap-2 leading-relaxed text-neutral-darker">
                        <span class="mt-1 shrink-0">•</span>
                        <span>Mỗi suất mua đặc quyền có hạn sử dụng 30 ngày kể từ ngày đổi.</span>
                    </li>
                </ul>
                <p class="mt-2 text-neutral-darker">
                    Lưu ý: Điểm đã đổi thành suất mua đặc quyền khi hết hạn sẽ không được hoàn lại.
                </p>
            </div>

            <p class="font-semibold mb-3 text-primary">5.2. Cách thức</p>
            <ol class="space-y-3 mb-5">
                <li class="flex items-start gap-3 text-primary">
                    <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent text-white mt-0.5">1</span>
                    <span class="leading-relaxed">Mua hàng tại chuỗi cửa hàng ChoCongNghe. Mỗi lần mua hàng với hóa đơn từ <strong>4.000đ</strong>, khách hàng tích lũy được 01 điểm thưởng tương ứng.</span>
                </li>
                <li class="flex items-start gap-3 text-primary">
                    <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent text-white mt-0.5">2</span>
                    <span class="leading-relaxed">Tìm kiếm từ khóa <strong>"ChoCongNghe"</strong> trên ứng dụng Zalo hoặc quét mã QR để theo dõi tài khoản Zalo chính thức của ChoCongNghe.</span>
                </li>
                <li class="flex items-start gap-3 text-primary">
                    <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent text-white mt-0.5">3</span>
                    <span class="leading-relaxed">Nhấn quan tâm hoặc kết bạn trên ứng dụng Zalo.</span>
                </li>
                <li class="flex items-start gap-3 text-primary">
                    <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent text-white mt-0.5">4</span>
                    <span class="leading-relaxed">Bấm tiếp tục ngay ở khung chat Zalo và nhập số điện thoại để đăng ký thành công khách hàng thân thiết.</span>
                </li>
                <li class="flex items-start gap-3 text-primary">
                    <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent text-white mt-0.5">5</span>
                    <span class="leading-relaxed">Sau khi kết bạn thành công, khách hàng có thể đổi điểm thưởng thành ưu đãi giảm giá khi mua hàng trực tiếp trên website hoặc hệ thống cửa hàng ChoCongNghe trên toàn quốc.</span>
                </li>
            </ol>

            <div class="rounded-lg p-4 bg-neutral-light-active border border-neutral">
                <p class="font-semibold mb-3 text-primary">
                    Trường hợp đổi điểm khi mua hàng:
                </p>
                <div class="space-y-3">
                    <div class="pl-4 border-l-[3px] border-accent">
                        <p class="font-semibold mb-1 text-neutral-darker">Mua trên website</p>
                        <p class="leading-relaxed text-primary">→ Chọn sản phẩm → thêm vào giỏ hàng → tại màn hình giỏ hàng bật toggle đổi điểm → điểm được quy đổi thành ưu đãi giảm giá → xác nhận và thanh toán.</p>
                    </div>
                    <div class="pl-4 border-l-[3px] border-accent">
                        <p class="font-semibold mb-1 text-neutral-darker">Mua qua tổng đài hoặc tại cửa hàng</p>
                        <p class="leading-relaxed text-primary">→ Liên hệ nhân viên shop hoặc nhân viên tư vấn để được hỗ trợ trực tiếp.</p>
                    </div>
                </div>
            </div>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">6. Các quy định khác</h2>
            <p class="font-semibold mb-3 text-primary">6.1. Quy định về số dư điểm / Hết hạn điểm</p>
            <ul class="space-y-2 mb-5">
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Khi điểm thưởng được sử dụng, số điểm có thời gian hết hạn gần nhất sẽ được tự động ưu tiên dùng trước để bảo toàn lợi ích cho khách hàng.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Khách hàng vui lòng kiểm tra thời hạn sử dụng của điểm thưởng để tránh trường hợp điểm hết hạn.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Điểm thưởng có hạn sử dụng trong vòng <strong>12 tháng</strong> kể từ lúc tích điểm và hết hạn vào ngày cuối cùng của tháng. <span class="text-neutral-darker">Ví dụ: Điểm tích vào ngày 24/09/2023 sẽ hết hạn vào ngày 30/09/2024.</span></span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Điểm thưởng được tích tại mỗi thời điểm khác nhau sẽ có thời hạn sử dụng khác nhau.</span>
                </li>
            </ul>

            <p class="font-semibold mb-3 text-primary">6.2. Quy định về khấu trừ / Hủy điểm</p>
            <ul class="space-y-2 mb-5">
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Sau khi khách hàng tiến hành đổi điểm thưởng thành ưu đãi, ChoCongNghe sẽ khấu trừ các điểm thưởng đã được tích trong hệ thống.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Các trường hợp trả sản phẩm sau khi đã được tích điểm, với mỗi giá trị trả là 4.000đ, khách hàng sẽ bị giảm 01 điểm thưởng trong hệ thống.</span>
                </li>
            </ul>

            <p class="font-semibold mb-3 text-primary">6.3. Các quy định khác</p>
            <ul class="space-y-2">
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Khi tham gia chương trình, khách hàng hiểu rằng phía ChoCongNghe có quyền quyết định, hạn chế, tạm ngưng, thu hồi, thay đổi các quy định liên quan của một phần hoặc toàn bộ Chương trình hoặc chấm dứt Chương trình theo quy định của pháp luật.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Việc kết thúc chương trình sẽ có hiệu lực trong ngày ghi trong thông báo và khách hàng phải sử dụng điểm đã tích để đổi quà tặng trong thời hạn này. Sau thời gian này, toàn bộ điểm tích lũy chưa đổi sẽ không được giải quyết.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Thể lệ và thời gian diễn ra chương trình có thể được thay đổi mà không cần thông báo trước.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Tất cả các thắc mắc và khiếu nại về chương trình, vui lòng liên hệ với chúng tôi qua hotline: <strong>1800.6060</strong> hoặc <strong>1800.6626</strong> (miễn phí).</span>
                </li>
            </ul>
        </section>
    </div>
  `.trim()
};