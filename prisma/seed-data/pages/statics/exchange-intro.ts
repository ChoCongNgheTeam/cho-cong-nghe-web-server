import { PageType } from "@prisma/client";
import { PageSeedData } from "../types";

export const exchangeIntroPage: PageSeedData = {
  title: "Giới thiệu chương trình Thu cũ đổi mới",
  slug: "thu-cu-doi-moi",
  type: PageType.PAGE,
  policyType: null,
  isPublished: true,
  priority: 5,
//   metaTitle: "Thu cũ đổi mới - Lên đời thiết bị công nghệ tiết kiệm tại ChoCongNghe",
//   metaDescription: "Chương trình thu cũ đổi mới tại ChoCongNghe Shop giúp bạn dễ dàng nâng cấp thiết bị điện thoại, laptop, tablet với mức định giá cao nhất thị trường, thủ tục siêu nhanh chóng.",
  content: `
    <div class="text-primary leading-relaxed mb-10 w-full">
        <h1 class="font-bold text-primary text-center mb-2">
            Giới thiệu máy đổi trả
        </h1>
        <p class="text-center text-primary mb-10">
            Đổi máy cũ – Lên đời máy mới dễ dàng tại ChoCongNghe Shop
        </p>

        <div class="rounded-xl bg-accent-light border border-accent-light-active px-6 py-5 mb-10 flex gap-4 items-start">
            <div class="shrink-0">🔄</div>
            <div>
                <p class="font-bold text-primary mb-1">
                    Chương trình thu cũ đổi mới
                </p>
                <p>
                    ChoCongNghe Shop triển khai chương trình
                    <span class="font-semibold text-accent">Thu cũ – Đổi mới</span> 
                    giúp khách hàng dễ dàng nâng cấp thiết bị công nghệ với chi
                    phí tối ưu. Giá trị máy cũ được định giá minh bạch, khấu trừ
                    trực tiếp vào hóa đơn sản phẩm mới.
                </p>
            </div>
        </div>

        <section class="mb-10">
            <h2 class="font-bold text-primary mb-4">
                1. Máy cũ kinh doanh tại Shop
            </h2>
            <p class="mb-4">
                Máy cũ kinh doanh tại Shop là các sản phẩm có nguồn gốc tin cậy,
                còn đủ điều kiện bảo hành và đã được Shop kiểm tra kỹ lưỡng trước
                khi đưa ra thị trường, bao gồm:
            </p>
            <div class="grid grid-cols-2 gap-4">
                <div class="rounded-xl border border-neutral p-5">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-xl">🖥️</span>
                        <p class="font-bold text-primary">Máy trưng bày (Demo)</p>
                    </div>
                    <p>
                        Là các sản phẩm được sử dụng để trưng bày tại cửa hàng nhằm
                        phục vụ nhu cầu trải nghiệm của khách hàng. Sau khi kết
                        thúc thời gian trưng bày, máy được kiểm định lại toàn diện
                        và điều chuyển sang kinh doanh.
                    </p>
                </div>
                <div class="rounded-xl border border-neutral p-5">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-xl">📦</span>
                        <p class="font-bold text-primary">Máy đã qua sử dụng</p>
                    </div>
                    <p>
                        Là các sản phẩm được thu lại từ khách hàng theo chính sách
                        thu cũ đổi mới hoặc đổi trả/bảo hành. Các máy này đã được
                        bảo hành chính hãng (nếu có) và được Shop kiểm tra chất
                        lượng nghiêm ngặt trước khi bán ra.
                    </p>
                </div>
            </div>
        </section>

        <section class="mb-10">
            <h2 class="font-bold text-primary mb-6">2. Quy trình đổi máy</h2>
            <div class="grid grid-cols-2 gap-4">
                <div class="flex gap-4 p-5 rounded-xl border border-neutral">
                    <div class="shrink-0 w-10 h-10 rounded-full bg-accent flex items-center justify-center text-neutral-light font-bold">01</div>
                    <div>
                        <p class="font-bold text-primary mb-1">Mang máy đến cửa hàng</p>
                        <p>Khách hàng mang thiết bị cũ đến bất kỳ cửa hàng ChoCongNghe Shop nào trên toàn quốc.</p>
                    </div>
                </div>
                <div class="flex gap-4 p-5 rounded-xl border border-neutral">
                    <div class="shrink-0 w-10 h-10 rounded-full bg-accent flex items-center justify-center text-neutral-light font-bold">02</div>
                    <div>
                        <p class="font-bold text-primary mb-1">Kiểm tra & định giá</p>
                        <p>Nhân viên kiểm tra tình trạng máy và đưa ra mức giá thu mua tốt nhất theo bảng giá hiện hành.</p>
                    </div>
                </div>
                <div class="flex gap-4 p-5 rounded-xl border border-neutral">
                    <div class="shrink-0 w-10 h-10 rounded-full bg-accent flex items-center justify-center text-neutral-light font-bold">03</div>
                    <div>
                        <p class="font-bold text-primary mb-1">Chọn máy mới</p>
                        <p>Khách hàng chọn sản phẩm mới muốn đổi và được trừ thẳng giá trị máy cũ vào hóa đơn.</p>
                    </div>
                </div>
                <div class="flex gap-4 p-5 rounded-xl border border-neutral">
                    <div class="shrink-0 w-10 h-10 rounded-full bg-accent flex items-center justify-center text-neutral-light font-bold">04</div>
                    <div>
                        <p class="font-bold text-primary mb-1">Thanh toán & nhận máy</p>
                        <p>Thanh toán phần chênh lệch và nhận máy mới ngay tại cửa hàng, kèm hóa đơn và bảo hành đầy đủ.</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="mb-10">
            <h2 class="font-bold text-primary mb-4">3. Thiết bị được thu mua</h2>
            <div class="grid grid-cols-3 gap-3">
                <div class="flex items-center gap-3 px-4 py-3 rounded-lg border border-neutral">
                    <span class="text-2xl">📱</span><span class="font-medium text-primary">Điện thoại</span>
                </div>
                <div class="flex items-center gap-3 px-4 py-3 rounded-lg border border-neutral">
                    <span class="text-2xl">💻</span><span class="font-medium text-primary">Laptop</span>
                </div>
                <div class="flex items-center gap-3 px-4 py-3 rounded-lg border border-neutral">
                    <span class="text-2xl">📱</span><span class="font-medium text-primary">Máy tính bảng</span>
                </div>
                <div class="flex items-center gap-3 px-4 py-3 rounded-lg border border-neutral">
                    <span class="text-2xl">⌚</span><span class="font-medium text-primary">Đồng hồ thông minh</span>
                </div>
                <div class="flex items-center gap-3 px-4 py-3 rounded-lg border border-neutral">
                    <span class="text-2xl">🎧</span><span class="font-medium text-primary">Tai nghe</span>
                </div>
                <div class="flex items-center gap-3 px-4 py-3 rounded-lg border border-neutral">
                    <span class="text-2xl">📷</span><span class="font-medium text-primary">Máy ảnh</span>
                </div>
            </div>
            <p class="mt-3">* Áp dụng cho các thương hiệu: Apple, Samsung, Xiaomi, OPPO, vivo, realme, Huawei, Dell, HP, Asus, Lenovo và nhiều thương hiệu khác.</p>
        </section>

        <section class="mb-10">
            <h2 class="font-bold text-primary mb-4">4. Điều kiện máy được thu</h2>
            <ul class="space-y-2.5">
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p>Máy còn hoạt động, màn hình không vỡ, không bể nát.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p>Không dính nước nặng, không bị bẻ cong biến dạng.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p>Còn đầy đủ thông tin IMEI, không bị khóa tài khoản iCloud / Google.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p>Máy không phải hàng nhái, hàng giả, hàng không rõ nguồn gốc.</p>
                </li>
                <li class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p>Khách hàng phải là chủ sở hữu hợp pháp của thiết bị.</p>
                </li>
            </ul>
        </section>

        <section class="mb-10">
            <h2 class="font-bold text-primary mb-4">🛡️ Chế độ bảo hành</h2>
            <div class="space-y-3">
                <div class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <div>
                        <p>
                            <span class="font-semibold text-primary">1 đổi 1 trong 30 ngày</span> 
                            nếu phát sinh lỗi do nhà sản xuất (*). Trong trường hợp không còn máy tương đương, khách hàng có thể:
                        </p>
                        <ul class="mt-2 space-y-1.5 ml-4">
                            <li class="flex gap-2">
                                <span class="mt-1.5 w-1 h-1 rounded-full bg-primary-light shrink-0"></span>
                                <p>Đổi sang sản phẩm khác có giá trị cao hơn (bù chênh lệch), hoặc</p>
                            </li>
                            <li class="flex gap-2">
                                <span class="mt-1.5 w-1 h-1 rounded-full bg-primary-light shrink-0"></span>
                                <p>Shop thu hồi lại máy theo chính sách hiện hành.</p>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p>Bảo hành theo hãng nếu sản phẩm còn thời hạn bảo hành mặc định của hãng.</p>
                </div>
                <div class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p>Bảo hành tại Shop từ 1–12 tháng đối với sản phẩm đã hết bảo hành hãng, tùy theo từng loại sản phẩm (**).</p>
                </div>
                <div class="flex gap-2.5">
                    <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"></span>
                    <p>Tiếp nhận bảo hành toàn quốc tại tất cả cửa hàng của Shop.</p>
                </div>
            </div>
        </section>

        <section class="mb-10">
            <h2 class="font-bold text-primary mb-4">✅ Cam kết chất lượng</h2>
            <p class="mb-4">
                Với mẫu mã đa dạng, mức giá hợp lý và quy trình kiểm định nghiêm
                ngặt, khách hàng hoàn toàn có thể yên tâm khi lựa chọn các sản
                phẩm máy cũ tại Shop. Tất cả sản phẩm trước khi bán ra đều được:
            </p>
            <div class="grid grid-cols-2 gap-3">
                <div class="flex items-center gap-3 px-4 py-3 rounded-lg border border-neutral bg-neutral-light-active">
                    <span class="w-5 h-5 rounded-full bg-accent flex items-center justify-center shrink-0">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    </span>
                    <span class="font-medium text-primary">Kiểm tra chức năng đầy đủ</span>
                </div>
                <div class="flex items-center gap-3 px-4 py-3 rounded-lg border border-neutral bg-neutral-light-active">
                    <span class="w-5 h-5 rounded-full bg-accent flex items-center justify-center shrink-0">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    </span>
                    <span class="font-medium text-primary">Đánh giá ngoại hình minh bạch</span>
                </div>
                <div class="flex items-center gap-3 px-4 py-3 rounded-lg border border-neutral bg-neutral-light-active">
                    <span class="w-5 h-5 rounded-full bg-accent flex items-center justify-center shrink-0">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    </span>
                    <span class="font-medium text-primary">Vệ sinh và tối ưu lại thiết bị</span>
                </div>
                <div class="flex items-center gap-3 px-4 py-3 rounded-lg border border-neutral bg-neutral-light-active">
                    <span class="w-5 h-5 rounded-full bg-accent flex items-center justify-center shrink-0">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    </span>
                    <span class="font-medium text-primary">Cập nhật phần mềm (nếu cần)</span>
                </div>
                <div class="flex items-center gap-3 px-4 py-3 rounded-lg border border-neutral bg-neutral-light-active">
                    <span class="w-5 h-5 rounded-full bg-accent flex items-center justify-center shrink-0">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    </span>
                    <span class="font-medium text-primary">Niêm phong và dán tem bảo hành</span>
                </div>
            </div>
        </section>

        <section class="mb-10">
            <h2 class="font-bold text-primary mb-4">🛒 Hướng dẫn mua hàng</h2>
            <p class="mb-3">Quý khách có thể:</p>
            <div class="space-y-3">
                <div class="flex gap-4 px-5 py-4 rounded-xl border border-neutral">
                    <span class="text-2xl shrink-0">🏪</span>
                    <div>
                        <p class="font-bold text-primary mb-0.5">Đến trực tiếp cửa hàng</p>
                        <p>Ghé Shop để xem và mua máy, được nhân viên tư vấn tận tình.</p>
                    </div>
                </div>
                <div class="flex gap-4 px-5 py-4 rounded-xl border border-neutral">
                    <span class="text-2xl shrink-0">🌐</span>
                    <div>
                        <p class="font-bold text-primary mb-0.5">Tìm kiếm trên Website</p>
                        <p>Duyệt danh sách sản phẩm máy cũ trực tuyến, lọc theo nhu cầu và ngân sách.</p>
                    </div>
                </div>
                <div class="flex gap-4 px-5 py-4 rounded-xl border border-neutral">
                    <span class="text-2xl shrink-0">⏱️</span>
                    <div>
                        <p class="font-bold text-primary mb-0.5">Đặt giữ hàng 24 giờ</p>
                        <p>Khi tìm được sản phẩm ưng ý, đặt giữ hàng trong 24 giờ để đến lấy trực tiếp.</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="mb-10">
            <h2 class="font-bold text-primary mb-4">5. Lợi ích nổi bật</h2>
            <div class="grid grid-cols-3 gap-4">
                <div class="p-5 rounded-xl border border-neutral text-center">
                    <div class="mb-3">💰</div>
                    <p class="font-bold text-primary mb-1.5">Giá thu tốt nhất</p>
                    <p>Định giá minh bạch theo thị trường, cam kết giá cao nhất khu vực.</p>
                </div>
                <div class="p-5 rounded-xl border border-neutral text-center">
                    <div class="mb-3">⚡</div>
                    <p class="font-bold text-primary mb-1.5">Xử lý nhanh chóng</p>
                    <p>Kiểm tra và định giá ngay tại chỗ, không cần chờ đợi lâu.</p>
                </div>
                <div class="p-5 rounded-xl border border-neutral text-center">
                    <div class="mb-3">🛡️</div>
                    <p class="font-bold text-primary mb-1.5">An toàn dữ liệu</p>
                    <p>Hỗ trợ xóa sạch dữ liệu cá nhân trước khi bàn giao máy cũ.</p>
                </div>
            </div>
        </section>

        <section class="mb-10">
            <h2 class="font-bold text-primary mb-4">6. Câu hỏi thường gặp</h2>
            <div class="space-y-3">
                <div class="rounded-lg border border-neutral overflow-hidden">
                    <div class="px-5 py-3.5 bg-neutral-light-active flex items-start gap-2">
                        <span class="text-accent font-bold shrink-0">Q.</span>
                        <p class="font-semibold text-primary">Tôi có thể đổi máy online không?</p>
                    </div>
                    <div class="px-5 py-3.5 flex items-start gap-2">
                        <span class="text-promotion font-bold shrink-0">A.</span>
                        <p>Hiện tại chương trình đổi máy chỉ áp dụng trực tiếp tại cửa hàng để nhân viên kiểm tra thiết bị và định giá chính xác.</p>
                    </div>
                </div>
                <div class="rounded-lg border border-neutral overflow-hidden">
                    <div class="px-5 py-3.5 bg-neutral-light-active flex items-start gap-2">
                        <span class="text-accent font-bold shrink-0">Q.</span>
                        <p class="font-semibold text-primary">Máy bị trầy xước nhẹ có được đổi không?</p>
                    </div>
                    <div class="px-5 py-3.5 flex items-start gap-2">
                        <span class="text-promotion font-bold shrink-0">A.</span>
                        <p>Có. Trầy xước nhẹ vẫn được chấp nhận nhưng sẽ ảnh hưởng đến mức giá định giá. Nhân viên sẽ tư vấn cụ thể sau khi kiểm tra.</p>
                    </div>
                </div>
                <div class="rounded-lg border border-neutral overflow-hidden">
                    <div class="px-5 py-3.5 bg-neutral-light-active flex items-start gap-2">
                        <span class="text-accent font-bold shrink-0">Q.</span>
                        <p class="font-semibold text-primary">Giá trị máy cũ được trừ vào hóa đơn như thế nào?</p>
                    </div>
                    <div class="px-5 py-3.5 flex items-start gap-2">
                        <span class="text-promotion font-bold shrink-0">A.</span>
                        <p>Giá trị máy cũ sẽ được khấu trừ trực tiếp vào giá bán của sản phẩm mới. Khách hàng chỉ cần thanh toán phần chênh lệch còn lại.</p>
                    </div>
                </div>
                <div class="rounded-lg border border-neutral overflow-hidden">
                    <div class="px-5 py-3.5 bg-neutral-light-active flex items-start gap-2">
                        <span class="text-accent font-bold shrink-0">Q.</span>
                        <p class="font-semibold text-primary">Có thể đổi máy cũ lấy tiền mặt không?</p>
                    </div>
                    <div class="px-5 py-3.5 flex items-start gap-2">
                        <span class="text-promotion font-bold shrink-0">A.</span>
                        <p>ChoCongNghe Shop chỉ áp dụng hình thức đổi máy cũ lấy máy mới, không thu mua thiết bị để trả tiền mặt trực tiếp.</p>
                    </div>
                </div>
            </div>
        </section>

        <div class="rounded-xl bg-accent px-6 py-6 text-center">
            <p class="font-bold text-neutral-light text-[16px] mb-1">
                Sẵn sàng đổi máy?
            </p>
            <p class="text-accent-light mb-4">
                Ghé ngay cửa hàng ChoCongNghe Shop gần nhất để được tư vấn và
                định giá miễn phí.
            </p>
            <a href="/store-locator" class="inline-block bg-neutral-light text-accent font-bold px-6 py-2.5 rounded-lg hover:bg-accent-light transition-colors">
                Tìm cửa hàng gần nhất
            </a>
        </div>
    </div>
  `.trim()
};