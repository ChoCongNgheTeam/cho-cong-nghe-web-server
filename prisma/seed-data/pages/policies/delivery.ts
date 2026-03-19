import { PageType, PolicyType } from "@prisma/client";
import { PageSeedData } from "../types";

export const deliveryPolicy: PageSeedData = {
  title: "Chính sách giao hàng ",
  slug: "chinh-sach-giao-hang",
  type: PageType.POLICY,
  policyType: PolicyType.DELIVERY, // Phân loại là Chính sách giao hàng & lắp đặt
  isPublished: true,
  priority: 3, // Đặt mức ưu tiên hiển thị
//   metaTitle: "Chính sách giao hàng tại nhà - ChoCongNghe",
//   metaDescription: "Tìm hiểu chi tiết chính sách miễn phí giao hàng, quy định thanh toán COD và hỗ trợ lắp đặt tại nhà khi mua sắm tại hệ thống ChoCongNghe.",
  content: `
    <div class="text-primary leading-relaxed w-full">
        <h1 class="font-bold mb-5 text-primary text-center text-[24px]">
            Chính sách giao hàng & lắp đặt
        </h1>

        <p class="leading-relaxed mb-6 text-primary">
            Mua hàng tại ChoCongNghe, khách hàng sẽ được hỗ trợ giao hàng tại nhà hầu như trên toàn quốc. Với độ phủ trên khắp 63 tỉnh thành, Quý khách sẽ nhận được sản phẩm nhanh chóng mà không cần mất thời gian di chuyển tới cửa hàng.
        </p>

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">1. Giao hàng tại nhà</h2>
            <ul class="space-y-2 mb-5">
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Áp dụng với tất cả các sản phẩm có áp dụng giao hàng tại nhà, không giới hạn giá trị.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Miễn phí giao hàng trong bán kính 20km có đặt shop (Đơn hàng giá trị dưới 100.000 VNĐ thu phí 10.000 VNĐ).</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Với khoảng cách lớn hơn 20km, nhân viên ChoCongNghe sẽ tư vấn chi tiết về cách thức giao nhận thuận tiện nhất.</span>
                </li>
            </ul>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">2. Thanh toán khi giao hàng</h2>
            <div class="space-y-2 mb-5">
                <div class="flex items-start gap-3 rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
                    <span class="font-bold px-2.5 py-1 rounded-full shrink-0 bg-accent-light text-accent">Đơn từ 50 triệu trở lên</span>
                    <span class="text-primary leading-relaxed">Quý khách phải thanh toán trước 100% giá trị đơn hàng nếu muốn giao hàng tại nhà.</span>
                </div>
                <div class="flex items-start gap-3 rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
                    <span class="font-bold px-2.5 py-1 rounded-full shrink-0 bg-accent-light text-accent">Đơn dưới 50 triệu</span>
                    <span class="text-primary leading-relaxed">Quý khách có thể nhận hàng và thanh toán tại nhà khi đồng ý mua hàng.</span>
                </div>
            </div>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">3. Hỗ trợ lắp đặt</h2>
            <p class="leading-relaxed mb-3 text-primary">
                Đối với các sản phẩm có chính sách lắp đặt tại nhà (TV, Điều hòa,...) sau khi sản phẩm được giao tới nơi, ChoCongNghe sẽ hỗ trợ <strong>tư vấn, lắp đặt và hướng dẫn sử dụng miễn phí</strong> cho khách hàng.
            </p>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">4. Quy định riêng đối với sản phẩm chỉ bán Online</h2>
            <div class="rounded-lg p-4 bg-neutral-light-active border border-neutral mb-4">
                <p class="font-semibold mb-3 text-primary">Quý khách lưu ý khi nhận hàng:</p>
                <ul class="space-y-2">
                    <li class="flex gap-2 leading-relaxed text-neutral-darker">
                        <span class="mt-1 shrink-0">•</span>
                        <span>Khi nhận hàng, Quý khách không đồng kiểm chi tiết với nhà vận chuyển (chỉ kiểm tra ngoại quan kiện hàng, không bóc và kiểm tra chi tiết sản phẩm bên trong). Trường hợp Quý khách không nhận sản phẩm, kiện hàng sẽ được nhà vận chuyển chuyển hoàn về nơi gửi.</span>
                    </li>
                    <li class="flex gap-2 leading-relaxed text-neutral-darker">
                        <span class="mt-1 shrink-0">•</span>
                        <span>Quý khách cần quay video khi nhận hàng mở kiện để được thực hiện đổi trả nếu hàng hoá có phát sinh vấn đề.</span>
                    </li>
                    <li class="flex gap-2 leading-relaxed text-neutral-darker">
                        <span class="mt-1 shrink-0">•</span>
                        <span>Quý khách có 01 ngày để gọi lên tổng đài khiếu nại trong trường hợp phát sinh vấn đề đến hàng hoá.</span>
                    </li>
                </ul>
            </div>
            <div class="rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
                <p class="text-neutral-darker">
                    Mọi thắc mắc về giao hàng, vui lòng liên hệ hotline <strong class="text-primary">1800.6060</strong> hoặc <strong class="text-primary">1800.6626</strong> để được hỗ trợ.
                </p>
            </div>
        </section>
    </div>
  `.trim()
};