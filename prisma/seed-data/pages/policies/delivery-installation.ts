import { PageType, PolicyType } from "@prisma/client";
import { PageSeedData } from "../types";

export const deliveryInstallationPolicy: PageSeedData = {
  title: "Chính sách giao hàng & lắp đặt Điện máy, Gia dụng",
  slug: "chinh-sach-giao-hang-lap-dat",
  type: PageType.POLICY,
  policyType: PolicyType.DELIVERY_INSTALLATION, 
  isPublished: true,
  priority: 4, 
//   metaTitle: "Chính sách giao hàng và lắp đặt Điện máy, Gia dụng - ChoCongNghe",
//   metaDescription: "Tìm hiểu chi tiết chính sách giao hàng miễn phí, quy định thanh toán và các điều kiện lắp đặt tiêu chuẩn, nâng cao cho sản phẩm điện máy, gia dụng tại ChoCongNghe.",
  content: `
    <div class="text-primary leading-relaxed w-full">
        <h1 class="font-bold mb-6 text-primary text-center text-[24px]">
            Chính sách giao hàng & lắp đặt Điện máy, Gia dụng
        </h1>

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">1. Một số định nghĩa</h2>
            <ul class="space-y-2">
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span><strong class="text-primary">Khoảng cách giao hàng:</strong> Là khoảng cách tính từ nơi mua hàng (cửa hàng) đến cửa nhà khách hàng.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span><strong class="text-primary">Khoảng cách lắp đặt:</strong> Là khoảng cách từ vị trí đặt thiết bị so với các nguồn cấp điện, cấp nước, đường thoát nước, vị trí treo/khoan bắt vít (đối với thiết bị cần lắp đặt cố định như máy lạnh, máy nước nóng, máy giặt, v.v.).</span>
                </li>
            </ul>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">2. Chính sách giao hàng</h2>
            <div class="rounded-lg overflow-hidden border border-neutral mb-4">
                <div class="grid grid-cols-3 font-semibold px-4 py-2.5 bg-neutral-light-active border-b border-neutral text-primary">
                    <span>Tiêu chí</span>
                    <span>Điều kiện</span>
                    <span>Chi phí</span>
                </div>
                <div class="divide-y divide-neutral">
                    <div class="grid grid-cols-3 px-4 py-3 gap-2">
                        <span class="text-primary font-medium">Thời gian giao hàng</span>
                        <span class="col-span-2 text-primary">24 - 48 tiếng tính từ lúc khách đặt hàng (hoặc theo thoả thuận với khách hàng).</span>
                    </div>
                    <div class="grid grid-cols-3 px-4 py-3 gap-2">
                        <span class="text-primary font-medium">Chi phí giao hàng</span>
                        <span class="text-primary">≤ 30km</span>
                        <span class="font-semibold text-accent">Miễn phí</span>
                    </div>
                    <div class="grid grid-cols-3 px-4 py-3 gap-2">
                        <span></span>
                        <span class="text-primary">&gt; 30km</span>
                        <span class="text-primary">Mỗi km tiếp theo tính phí <strong>5.000đ/km</strong></span>
                    </div>
                </div>
            </div>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">3. Chính sách lắp đặt</h2>
            <ul class="space-y-2 mb-5">
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span><strong class="text-primary">Thời gian lắp đặt:</strong> 24 - 48 tiếng tính từ lúc khách nhận hàng (hoặc theo thời gian thoả thuận với khách hàng).</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span><strong class="text-primary">Thời gian phản ánh tình trạng sau lắp đặt:</strong> Trong vòng 48 tiếng sau khi hoàn tất lắp đặt (chi phí phát sinh sau thời gian này sẽ do 2 bên thỏa thuận).</span>
                </li>
            </ul>

            <p class="font-semibold mb-3 text-primary">3.1. Chính sách lắp đặt sản phẩm điện máy</p>

            <div class="rounded-lg overflow-hidden border border-neutral mb-4">
                <div class="grid grid-cols-4 font-semibold px-4 py-2.5 bg-neutral-light-active border-b border-neutral text-primary">
                    <span>Loại lắp đặt</span>
                    <span>Sản phẩm</span>
                    <span>Điều kiện</span>
                    <span>Chi phí</span>
                </div>

                <div class="divide-y divide-neutral">
                    <div class="grid grid-cols-4 px-4 py-3 gap-2 items-start">
                        <span class="font-semibold text-accent">Lắp đặt tiêu chuẩn (miễn phí)</span>
                        <span class="text-primary">Máy giặt, máy sấy</span>
                        <span class="text-neutral-darker">Vị trí lắp đặt của KH có sẵn đường ống nước</span>
                        <span class="font-semibold text-accent">Miễn phí</span>
                    </div>
                    <div class="grid grid-cols-4 px-4 py-3 gap-2 items-start">
                        <span></span>
                        <span class="text-primary">Tủ lạnh, tủ đông, tủ mát</span>
                        <span class="text-neutral-darker">Đường điện không quá 2m</span>
                        <span></span>
                    </div>
                    <div class="grid grid-cols-4 px-4 py-3 gap-2 items-start">
                        <span></span>
                        <span class="text-primary">Máy lạnh</span>
                        <span class="text-neutral-darker">Vị trí lắp đặt không cao quá 4m (tính từ mặt sàn)</span>
                        <span></span>
                    </div>
                </div>

                <div class="border-t border-neutral divide-y divide-neutral">
                    <div class="grid grid-cols-4 px-4 py-3 gap-2 items-start">
                        <span class="font-semibold text-neutral-darker">Lắp đặt nâng cao (có tính phí)</span>
                        <span class="text-primary font-medium">Máy giặt, máy sấy</span>
                        <ul class="space-y-1">
                            <li class="flex gap-1 text-neutral-darker"><span class="shrink-0">•</span><span>Vị trí lắp đặt không thuận lợi, cần xe cẩu, giàn giáo để đưa vào</span></li>
                            <li class="flex gap-1 text-neutral-darker"><span class="shrink-0">•</span><span>Nguồn nước yếu cần lắp thêm bơm tăng áp.</span></li>
                        </ul>
                        <span class="text-neutral-darker">KH chịu phí phát sinh (thỏa thuận với đơn vị thi công)</span>
                    </div>
                    <div class="grid grid-cols-4 px-4 py-3 gap-2 items-start">
                        <span></span>
                        <span class="text-primary font-medium">Tủ lạnh</span>
                        <ul class="space-y-1">
                            <li class="flex gap-1 text-neutral-darker"><span class="shrink-0">•</span><span>Vị trí lắp đặt không thuận lợi cần xe cẩu, giàn giáo để đưa vào</span></li>
                        </ul>
                        <span></span>
                    </div>
                    <div class="grid grid-cols-4 px-4 py-3 gap-2 items-start">
                        <span></span>
                        <span class="text-primary font-medium">Máy lạnh</span>
                        <ul class="space-y-1">
                            <li class="flex gap-1 text-neutral-darker"><span class="shrink-0">•</span><span>Phát sinh vật tư (vật tư chính và phụ) thêm ngoài khuyến mãi.</span></li>
                            <li class="flex gap-1 text-neutral-darker"><span class="shrink-0">•</span><span>Vị trí đặt dàn nóng cao hơn 4m và cần thuê giàn giáo</span></li>
                            <li class="flex gap-1 text-neutral-darker"><span class="shrink-0">•</span><span>Thi công đường ống âm tường</span></li>
                            <li class="flex gap-1 text-neutral-darker"><span class="shrink-0">•</span><span>Vệ sinh đường ống cũ</span></li>
                            <li class="flex gap-1 text-neutral-darker"><span class="shrink-0">•</span><span>Tháo, lắp máy cũ</span></li>
                            <li class="flex gap-1 text-neutral-darker"><span class="shrink-0">•</span><span>Hàn ống đồng</span></li>
                        </ul>
                        <span></span>
                    </div>
                    <div class="grid grid-cols-4 px-4 py-3 gap-2 items-start">
                        <span></span>
                        <span class="text-primary font-medium">Tivi</span>
                        <ul class="space-y-1">
                            <li class="flex gap-1 text-neutral-darker"><span class="shrink-0">•</span><span>Lắp đặt giá treo di động</span></li>
                        </ul>
                        <span></span>
                    </div>
                </div>
            </div>

            <div class="rounded-lg p-4 bg-neutral-light-active border border-neutral mb-6">
                <p class="font-semibold mb-2 text-primary">Lưu ý</p>
                <p class="leading-relaxed text-neutral-darker">
                    TV từ 65inch khuyến cáo không treo tường. Nếu khách hàng yêu cầu thì cần ký biên bản miễn trừ trách nhiệm nếu bị rơi trong quá trình sử dụng.
                </p>
            </div>

            <p class="font-semibold mb-3 text-primary">3.2. Chính sách lắp đặt sản phẩm gia dụng</p>

            <div class="rounded-lg overflow-hidden border border-neutral">
                <div class="grid grid-cols-4 font-semibold px-4 py-2.5 bg-neutral-light-active border-b border-neutral text-primary">
                    <span>Loại lắp đặt</span>
                    <span>Sản phẩm</span>
                    <span>Điều kiện</span>
                    <span>Chi phí</span>
                </div>

                <div class="divide-y divide-neutral">
                    <div class="grid grid-cols-4 px-4 py-3 gap-2 items-start">
                        <span class="font-semibold text-accent">Lắp đặt tiêu chuẩn (miễn phí)</span>
                        <span class="text-primary">Máy nước nóng gián tiếp/trực tiếp</span>
                        <span class="text-neutral-darker">Vị trí lắp đặt của KH có sẵn đường ống nước chờ tại vị trí lắp máy</span>
                        <span class="font-semibold text-accent">Miễn phí</span>
                    </div>
                    <div class="grid grid-cols-4 px-4 py-3 gap-2 items-start">
                        <span></span>
                        <span class="text-primary">Máy lọc nước</span>
                        <span class="text-neutral-darker">Vị trí lắp đặt của KH có sẵn đường ống nước chờ tại vị trí lắp máy</span>
                        <span></span>
                    </div>
                    <div class="grid grid-cols-4 px-4 py-3 gap-2 items-start">
                        <span></span>
                        <span class="text-primary">Máy rửa bát</span>
                        <span class="text-neutral-darker">Vị trí lắp đặt của KH có sẵn đường ống nước chờ tại vị trí lắp máy</span>
                        <span></span>
                    </div>
                    <div class="grid grid-cols-4 px-4 py-3 gap-2 items-start">
                        <span></span>
                        <span class="text-primary">Bếp từ/hồng ngoại đa, Máy hút mùi</span>
                        <span class="text-neutral-darker">Vị trí lắp vừa với kích thước Bếp/Hút mùi và có sẵn đường điện chờ (Loại trừ KG498, KG499, HS-I15521FG)</span>
                        <span></span>
                    </div>
                </div>

                <div class="border-t border-neutral divide-y divide-neutral">
                    <div class="grid grid-cols-4 px-4 py-3 gap-2 items-start">
                        <span class="font-semibold text-neutral-darker">Lắp đặt nâng cao (có tính phí)</span>
                        <span class="text-primary font-medium">Máy nước nóng gián tiếp/trực tiếp</span>
                        <ul class="space-y-1">
                            <li class="flex gap-1 text-neutral-darker"><span class="shrink-0">•</span><span>Có thêm vật tư phát sinh</span></li>
                            <li class="flex gap-1 text-neutral-darker"><span class="shrink-0">•</span><span>Thi công ống âm tường</span></li>
                            <li class="flex gap-1 text-neutral-darker"><span class="shrink-0">•</span><span>Tháo, lắp máy cũ</span></li>
                        </ul>
                        <span class="text-neutral-darker">KH chịu phí phát sinh (thỏa thuận với đơn vị thi công)</span>
                    </div>
                    <div class="grid grid-cols-4 px-4 py-3 gap-2 items-start">
                        <span></span>
                        <span class="text-primary font-medium">Máy lọc nước</span>
                        <ul class="space-y-1">
                            <li class="flex gap-1 text-neutral-darker"><span class="shrink-0">•</span><span>Có thêm vật tư phát sinh</span></li>
                            <li class="flex gap-1 text-neutral-darker"><span class="shrink-0">•</span><span>Thi công ống âm tường</span></li>
                            <li class="flex gap-1 text-neutral-darker"><span class="shrink-0">•</span><span>Khoan/khoét lỗ tường gạch bê tông/Tủ gỗ</span></li>
                        </ul>
                        <span></span>
                    </div>
                    <div class="grid grid-cols-4 px-4 py-3 gap-2 items-start">
                        <span></span>
                        <span class="text-primary font-medium">Máy rửa bát</span>
                        <ul class="space-y-1">
                            <li class="flex gap-1 text-neutral-darker"><span class="shrink-0">•</span><span>Có thêm vật tư phát sinh</span></li>
                            <li class="flex gap-1 text-neutral-darker"><span class="shrink-0">•</span><span>Thi công ống âm tường</span></li>
                        </ul>
                        <span></span>
                    </div>
                    <div class="grid grid-cols-4 px-4 py-3 gap-2 items-start">
                        <span></span>
                        <span class="text-primary font-medium">Máy hút mùi, Bếp từ/hồng ngoại đa</span>
                        <ul class="space-y-1">
                            <li class="flex gap-1 text-neutral-darker"><span class="shrink-0">•</span><span>Có thêm vật tư phát sinh</span></li>
                            <li class="flex gap-1 text-neutral-darker"><span class="shrink-0">•</span><span>Khoan/cắt ghép đá, bê tông, gỗ (hãng Hafele, Pramie hỗ trợ khoan cắt đá miễn phí)</span></li>
                        </ul>
                        <span></span>
                    </div>
                </div>
            </div>
        </section>
    </div>
  `.trim()
};