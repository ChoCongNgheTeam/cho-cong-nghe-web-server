import { PageType, PolicyType } from "@prisma/client";
import { PageSeedData } from "../types";

export const unboxingPolicy: PageSeedData = {
  title: "Chính sách khui hộp sản phẩm",
  slug: "chinh-sach-khui-hop",
  type: PageType.POLICY,
  policyType: PolicyType.UNBOXING, // Phân loại là Chính sách khui hộp (đồng kiểm)
  isPublished: true,
  priority: 11, // Độ ưu tiên hiển thị
//   metaTitle: "Chính sách khui hộp và đồng kiểm sản phẩm - ChoCongNghe",
//   metaDescription: "Quy định về việc khui seal, đồng kiểm ngoại quan và kích hoạt bảo hành điện tử ngay tại cửa hàng hoặc khi nhận hàng tại nhà tại hệ thống ChoCongNghe.",
  content: `
    <div class="text-primary leading-relaxed mb-10 w-full">
        <h1 class="font-bold mb-5 text-primary text-center text-[24px]">
            Chính sách khui hộp sản phẩm
        </h1>

        <div class="rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral mb-6">
            <p class="text-primary">
                <strong>Áp dụng cho:</strong> Các sản phẩm bán ra tại ChoCongNghe bao gồm Điện thoại di động, Máy tính, Máy tính bảng, Đồng hồ thông minh.
            </p>
        </div>

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">Nội dung chính sách</h2>
            <ul class="space-y-3 mb-5">
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Sản phẩm bắt buộc phải khui seal/mở hộp và kích hoạt bảo hành điện tử (Active) ngay tại shop hoặc ngay tại thời điểm nhận hàng khi có nhân viên giao hàng tại nhà.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Đối với các sản phẩm bán nguyên seal, khách hàng cần phải thanh toán trước 100% giá trị đơn hàng trước khi khui seal sản phẩm.</span>
                </li>
            </ul>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">Lưu ý</h2>
            <ul class="space-y-3">
                <li class="flex gap-3 leading-relaxed text-primary">
                    <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent-light text-accent mt-0.5">1</span>
                    <span>Trước khi kích hoạt bảo hành điện tử (Active), khách hàng cần kiểm tra các <strong>lỗi ngoại quan</strong> của sản phẩm (Cấn/Trầy thân máy, bụi trong camera, bụi màn hình, hở viền…). Nếu phát hiện các lỗi trên, khách hàng sẽ được <strong>đổi 1 sản phẩm khác hoặc hoàn tiền</strong>.</span>
                </li>
                <li class="flex gap-3 leading-relaxed text-primary">
                    <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent-light text-accent mt-0.5">2</span>
                    <span>Ngay sau khi kiểm tra lỗi ngoại quan, tiến hành bật nguồn để kiểm tra lỗi kỹ thuật; nếu sản phẩm có <strong>lỗi kỹ thuật của nhà sản xuất</strong>, khách hàng sẽ được <strong>đổi 1 sản phẩm mới tương đương</strong> tại ChoCongNghe.</span>
                </li>
                <li class="flex gap-3 leading-relaxed text-primary">
                    <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent-light text-accent mt-0.5">3</span>
                    <span>Nếu Quý khách báo lỗi ngoại quan sau khi sản phẩm đã được kích hoạt bảo hành điện tử (Active) hoặc sau khi nhân viên giao hàng rời đi, ChoCongNghe chỉ hỗ trợ chuyển sản phẩm của khách hàng đến hãng để thẩm định và xử lý.</span>
                </li>
            </ul>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">Một số lỗi thẩm mỹ thường gặp</h2>
            <div class="rounded-lg p-4 bg-neutral-light-active border border-neutral">
                <ul class="space-y-2">
                    <li class="flex gap-2 leading-relaxed text-neutral-darker">
                        <span class="mt-1 shrink-0">•</span>
                        <span>Cấn, trầy thân máy – va chạm vật lý trong quá trình vận chuyển</span>
                    </li>
                    <li class="flex gap-2 leading-relaxed text-neutral-darker">
                        <span class="mt-1 shrink-0">•</span>
                        <span>Bụi lọt vào camera trước / sau</span>
                    </li>
                    <li class="flex gap-2 leading-relaxed text-neutral-darker">
                        <span class="mt-1 shrink-0">•</span>
                        <span>Bụi dưới màn hình (dead pixel vùng viền)</span>
                    </li>
                    <li class="flex gap-2 leading-relaxed text-neutral-darker">
                        <span class="mt-1 shrink-0">•</span>
                        <span>Hở viền giữa khung máy và màn hình</span>
                    </li>
                    <li class="flex gap-2 leading-relaxed text-neutral-darker">
                        <span class="mt-1 shrink-0">•</span>
                        <span>Xước mặt kính phía sau hoặc viền kim loại</span>
                    </li>
                </ul>
                <p class="mt-3 text-neutral-darker">
                    Quý khách phát hiện bất kỳ lỗi nào trong danh sách trên trước khi Active, vui lòng thông báo ngay cho nhân viên ChoCongNghe để được hỗ trợ đổi sản phẩm hoặc hoàn tiền.
                </p>
            </div>
        </section>
    </div>
  `.trim()
};