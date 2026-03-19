import { PageType, PolicyType } from "@prisma/client";
import { PageSeedData } from "../types";

export const dataPrivacyPolicy: PageSeedData = {
  title: "Chính sách bảo mật dữ liệu",
  slug: "chinh-sach-bao-mat-du-lieu",
  type: PageType.POLICY,
  policyType: PolicyType.DATA_PRIVACY, // Phân loại là Chính sách bảo mật
  isPublished: true,
  priority: 2, // Nên để mức ưu tiên cao nhất hoặc thứ 2 trong nhóm chính sách
//   metaTitle: "Chính sách bảo mật dữ liệu cá nhân khách hàng - ChoCongNghe",
//   metaDescription: "Quy định chi tiết về mục đích, phạm vi thu thập và các biện pháp bảo mật dữ liệu cá nhân của khách hàng tại hệ thống ChoCongNghe.",
  content: `
    <div class="text-primary leading-relaxed mb-10 w-full">
        <h1 class="font-bold mb-5 text-primary text-center text-[24px]">
            Chính sách bảo mật dữ liệu cá nhân khách hàng
        </h1>

        <p class="leading-relaxed mb-6 text-primary">
            Chính sách bảo mật dữ liệu cá nhân khách hàng này được thực hiện bởi <strong>Công ty Cổ phần ChoCongNghe</strong> ("ChoCongNghe", "Công ty"), mô tả các hoạt động liên quan đến việc xử lý dữ liệu cá nhân của Khách hàng để Khách hàng hiểu rõ hơn về mục đích, phạm vi thông tin mà ChoCongNghe xử lý, các biện pháp ChoCongNghe áp dụng để bảo vệ thông tin và quyền của Quý Khách hàng.
        </p>
        <p class="leading-relaxed mb-6 text-primary">
            Chính sách này là một phần không thể tách rời của các hợp đồng, thỏa thuận, điều khoản và điều kiện ràng buộc mối quan hệ giữa ChoCongNghe và Khách hàng.
        </p>

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">Điều 1. Đối tượng và phạm vi áp dụng</h2>
            <p class="leading-relaxed mb-3 text-primary">
                Chính sách này điều chỉnh cách thức mà ChoCongNghe xử lý dữ liệu cá nhân của Khách hàng và những người có liên quan đến Khách hàng theo các mối quan hệ do pháp luật yêu cầu phải xử lý dữ liệu hoặc người đồng sử dụng các sản phẩm/dịch vụ của ChoCongNghe.
            </p>
            <p class="leading-relaxed text-primary">
                Chính sách này chỉ áp dụng cho các Khách hàng cá nhân. ChoCongNghe khuyến khích Khách hàng đọc kỹ Chính sách này và thường xuyên kiểm tra để cập nhật bất kỳ thay đổi nào.
            </p>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">Điều 2. Giải thích từ ngữ</h2>
            <ul class="space-y-2">
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span><strong>"Khách hàng"</strong> là cá nhân tiếp cận, tìm hiểu, đăng ký, sử dụng hoặc có liên quan trong quy trình hoạt động, cung cấp các sản phẩm, dịch vụ của ChoCongNghe.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span><strong>"ChoCongNghe"</strong> là Công ty Cổ phần ChoCongNghe, địa chỉ trụ sở chính theo đăng ký kinh doanh.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span><strong>"Dữ liệu cá nhân"</strong> hay "DLCN" là dữ liệu dưới dạng số hoặc thông tin dưới dạng khác xác định hoặc giúp xác định một con người cụ thể, bao gồm dữ liệu cá nhân cơ bản và dữ liệu cá nhân nhạy cảm.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span><strong>"Kênh giao dịch ChoCongNghe"</strong>: gồm website chocongnghe.vn, ứng dụng ChoCongNghe, Zalo và các kênh giao dịch khác nhằm cung cấp sản phẩm/dịch vụ.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Các khái niệm "dữ liệu cá nhân cơ bản", "dữ liệu cá nhân nhạy cảm", "bảo vệ dữ liệu cá nhân", "xử lý dữ liệu cá nhân" được hiểu theo Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 và Nghị định 356/2025/NĐ-CP.</span>
                </li>
            </ul>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">Điều 3. Mục đích xử lý dữ liệu cá nhân</h2>
            <p class="leading-relaxed mb-3 text-primary">
                Trong phạm vi Khách hàng cho phép và/hoặc trong phạm vi pháp luật yêu cầu, ChoCongNghe có thể sử dụng DLCN của Khách hàng cho các mục đích sau:
            </p>
            <ul class="space-y-3">
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span><strong>Mục đích mua hàng và sử dụng dịch vụ:</strong> Giúp Khách hàng mua hàng, sử dụng dịch vụ và đáp ứng các yêu cầu; xác minh danh tính; bảo mật tài khoản; ngăn chặn gian lận và hành vi bất hợp pháp.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span><strong>Nâng cao trải nghiệm khách hàng:</strong> Thực hiện chăm sóc khách hàng, chương trình hậu mãi; đáp ứng yêu cầu hỗ trợ; đo lường và cải thiện chất lượng sản phẩm/dịch vụ.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span><strong>Nghiên cứu thị trường:</strong> Tổ chức các hoạt động nghiên cứu, thăm dò dư luận nhằm cải thiện chất lượng và phát triển sản phẩm/dịch vụ mới (có thông báo riêng cho từng chương trình).</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span><strong>Truyền thông và tiếp thị:</strong> Thông báo về sản phẩm/dịch vụ mới, chính sách và các chương trình khuyến mại của ChoCongNghe.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span><strong>Các mục đích khác</strong> mà ChoCongNghe thông báo cho Khách hàng vào thời điểm thu thập dữ liệu hoặc theo quy định của pháp luật.</span>
                </li>
            </ul>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">Điều 4. Bảo mật dữ liệu cá nhân khách hàng</h2>
            <div class="rounded-lg p-4 bg-neutral-light-active border border-neutral mb-4">
                <p class="font-semibold mb-2 text-primary">Nguyên tắc bảo mật:</p>
                <ul class="space-y-2">
                    <li class="flex gap-2 leading-relaxed text-neutral-darker">
                        <span class="mt-1 shrink-0">•</span>
                        <span>Dữ liệu cá nhân của Khách hàng được cam kết bảo mật theo quy định của ChoCongNghe và pháp luật. Việc xử lý chỉ được thực hiện khi có sự đồng ý của Khách hàng, trừ trường hợp pháp luật có quy định khác.</span>
                    </li>
                    <li class="flex gap-2 leading-relaxed text-neutral-darker">
                        <span class="mt-1 shrink-0">•</span>
                        <span>ChoCongNghe không sử dụng, chuyển giao, cung cấp hay chia sẻ Dữ liệu cá nhân của Khách hàng cho bên thứ ba khi không có sự đồng ý của Khách hàng, trừ trường hợp pháp luật có quy định khác.</span>
                    </li>
                </ul>
            </div>
            <p class="font-semibold mb-2 text-primary">Một số rủi ro không mong muốn có thể xảy ra:</p>
            <ul class="space-y-2">
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Lỗi phần cứng, phần mềm trong quá trình xử lý dữ liệu làm mất dữ liệu của Khách hàng.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Lỗ hổng bảo mật nằm ngoài khả năng kiểm soát của ChoCongNghe, hệ thống bị tấn công gây lộ lọt dữ liệu.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Khách hàng tự làm lộ dữ liệu do bất cẩn hoặc bị lừa đảo truy cập website/ứng dụng độc hại.</span>
                </li>
            </ul>
            <div class="rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral mt-4">
                <p class="text-neutral-darker">
                    ChoCongNghe khuyến cáo Khách hàng bảo mật mật khẩu đăng nhập, mã OTP và không chia sẻ với bất kỳ ai. Nên khóa, đăng xuất khỏi tài khoản trên website/ứng dụng khi không sử dụng.
                </p>
            </div>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">Điều 5. Các loại dữ liệu cá nhân ChoCongNghe xử lý</h2>
            <ul class="space-y-2">
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Dữ liệu cá nhân cơ bản của Khách hàng được cung cấp khi giao kết, thực hiện hợp đồng, giao dịch với ChoCongNghe.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Dữ liệu cá nhân nhạy cảm cần thiết cho việc cung cấp hàng hoá/dịch vụ (ChoCongNghe sẽ thông báo ngay khi thu thập).</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Dữ liệu kỹ thuật: loại thiết bị, hệ điều hành, loại trình duyệt, địa chỉ IP, cài đặt ngôn ngữ, ngày giờ kết nối, dữ liệu vị trí.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Dữ liệu tiếp thị: sở thích quảng cáo, dữ liệu cookie, lịch sử duyệt web, phản ứng với tiếp thị trực tiếp.</span>
                </li>
            </ul>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">Điều 6. Cách thức thu thập dữ liệu cá nhân</h2>
            <p class="font-semibold mb-2 text-primary">Trực tiếp từ Khách hàng:</p>
            <ul class="space-y-2 mb-4">
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Khi Khách hàng đăng ký hoặc điền thông tin vào bất kỳ biểu mẫu nào liên quan đến sản phẩm/dịch vụ của ChoCongNghe.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Khi Khách hàng tương tác với nhân viên qua điện thoại, email, gặp mặt trực tiếp hoặc mạng xã hội.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Khi Khách hàng sử dụng website, ứng dụng hoặc thiết lập tài khoản trực tuyến với ChoCongNghe.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Khi Khách hàng mua hoặc sử dụng dịch vụ của bên thứ ba thông qua ChoCongNghe tại các điểm giao dịch.</span>
                </li>
            </ul>
            <p class="font-semibold mb-2 text-primary">Từ bên thứ ba:</p>
            <ul class="space-y-2">
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Từ các đối tác cung cấp dịch vụ thanh toán khi Khách hàng thanh toán điện tử.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Từ các cơ quan pháp luật và cơ quan công quyền theo nghĩa vụ pháp lý.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Từ các nguồn công khai hợp pháp (danh bạ, thông tin quảng cáo, trang tin điện tử công khai,...).</span>
                </li>
            </ul>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">Điều 9. Quyền và nghĩa vụ của Khách hàng</h2>
            <p class="font-semibold mb-3 text-primary">9.1. Quyền của Khách hàng</p>
            <ul class="space-y-2 mb-5">
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Được biết về hoạt động xử lý dữ liệu cá nhân của mình.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Được đồng ý hoặc không đồng ý cho phép xử lý dữ liệu cá nhân.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Được quyền truy cập để xem, chỉnh sửa hoặc yêu cầu chỉnh sửa dữ liệu cá nhân bằng văn bản gửi đến ChoCongNghe.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Được quyền rút lại sự đồng ý bằng văn bản gửi đến ChoCongNghe (không ảnh hưởng đến tính hợp pháp của việc xử lý trước đó).</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Được quyền xóa hoặc yêu cầu xóa dữ liệu cá nhân.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Được quyền yêu cầu hạn chế xử lý dữ liệu cá nhân.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Được quyền phản đối ChoCongNghe xử lý dữ liệu nhằm ngăn chặn việc sử dụng cho mục đích quảng cáo, tiếp thị.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Có quyền khiếu nại, tố cáo hoặc khởi kiện; yêu cầu bồi thường theo quy định pháp luật nếu ChoCongNghe vi phạm.</span>
                </li>
            </ul>
            <p class="font-semibold mb-3 text-primary">9.2. Nghĩa vụ của Khách hàng</p>
            <ul class="space-y-2">
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Tuân thủ các quy định của pháp luật và hướng dẫn của ChoCongNghe liên quan đến xử lý dữ liệu cá nhân.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Cung cấp đầy đủ, trung thực, chính xác dữ liệu cá nhân theo yêu cầu và thông báo kịp thời khi có thay đổi.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Phối hợp với ChoCongNghe và cơ quan nhà nước khi phát sinh vấn đề ảnh hưởng đến bảo mật dữ liệu.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Tự bảo vệ dữ liệu cá nhân; chủ động áp dụng các biện pháp bảo vệ trong quá trình sử dụng dịch vụ.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Tôn trọng và bảo vệ dữ liệu cá nhân của người khác.</span>
                </li>
            </ul>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">Điều 10. Lưu trữ dữ liệu</h2>
            <p class="leading-relaxed text-primary">
                ChoCongNghe cam kết chỉ lưu trữ dữ liệu cá nhân của Khách hàng trong các trường hợp liên quan đến mục đích nêu trong Chính sách này. Thời hạn lưu trữ tối đa không quá <strong>10 năm</strong> kể từ ngày Khách hàng thực hiện giao dịch cuối cùng với ChoCongNghe hoặc thời hạn ngắn hơn được thông báo khi thu thập dữ liệu.
            </p>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">Điều 14. Thông tin liên hệ xử lý dữ liệu cá nhân</h2>
            <p class="leading-relaxed mb-4 text-primary">
                Trường hợp Khách hàng có bất kỳ câu hỏi nào liên quan đến Chính sách này hoặc muốn thực hiện các quyền của chủ thể dữ liệu, vui lòng liên hệ:
            </p>
            <div class="space-y-2">
                <div class="flex items-start gap-3 rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
                    <span class="font-bold shrink-0 text-accent">Hotline:</span>
                    <span class="text-primary"><strong>1800.6060</strong> hoặc <strong>1800.6626</strong> (miễn phí)</span>
                </div>
                <div class="flex items-start gap-3 rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
                    <span class="font-bold shrink-0 text-accent">Email:</span>
                    <span class="text-primary">chocongnghe@chocongnghe.vn</span>
                </div>
                <div class="flex items-start gap-3 rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
                    <span class="font-bold shrink-0 text-accent">Website:</span>
                    <span class="text-primary">chocongnghe.vn</span>
                </div>
                <div class="flex items-start gap-3 rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral">
                    <span class="font-bold shrink-0 text-accent">Địa chỉ:</span>
                    <span class="text-primary">Vui lòng đến cửa hàng ChoCongNghe gần nhất để được hỗ trợ trực tiếp.</span>
                </div>
            </div>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-3 text-primary">Điều 15. Điều khoản chung</h2>
            <ul class="space-y-2">
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Chính sách này có hiệu lực từ ngày 01/01/2026. Chính sách có thể được sửa đổi theo từng thời kỳ và được đăng tải công khai trên website, ứng dụng của ChoCongNghe.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Trong quá trình thực hiện nếu phát sinh tranh chấp, các Bên sẽ chủ động giải quyết thông qua thương lượng, hòa giải. Trường hợp không thành, tranh chấp sẽ được đưa ra Tòa án nhân dân có thẩm quyền.</span>
                </li>
                <li class="flex gap-2 leading-relaxed text-primary">
                    <span class="mt-1 shrink-0">•</span>
                    <span>Khi nhận được yêu cầu thực hiện quyền của Khách hàng, ChoCongNghe sẽ xác nhận danh tính người yêu cầu trước khi triển khai. Trường hợp xóa/hủy dữ liệu theo yêu cầu, một số quyền lợi theo hợp đồng có thể bị gián đoạn hoặc chấm dứt.</span>
                </li>
            </ul>
        </section>
    </div>
  `.trim()
};