import { PageType, PolicyType } from "@prisma/client";
import { PageSeedData } from "../types";

export const mobileNetworkPolicy: PageSeedData = {
  title: "Chính sách mạng di động",
  slug: "chinh-sach-mang-di-dong",
  type: PageType.POLICY,
  policyType: PolicyType.MOBILE_NETWORK, // Phân loại là Chính sách mạng di động
  isPublished: true,
  priority: 7, // Độ ưu tiên hiển thị
//   metaTitle: "Chính sách mạng di động và giá cước viễn thông - ChoCongNghe",
//   metaDescription: "Chi tiết quy định về chính sách giá cước dịch vụ viễn thông, cách thức đăng ký, tính cước Data, Thoại, SMS đối với mạng di động tại hệ thống ChoCongNghe.",
  content: `
    <div class="text-primary leading-relaxed mb-10 w-full">
        <h1 class="font-bold mb-5 text-primary text-center text-[24px]">
            Chính sách mạng di động ChoCongNghe
        </h1>

        <section class="mb-6">
            <h2 class="font-bold mb-4 text-primary text-xl">A. MỤC ĐÍCH VÀ PHẠM VI ÁP DỤNG</h2>
            <div class="space-y-4">
                <div class="mb-4">
                    <h3 class="font-semibold mb-3 text-primary text-lg">I. Mục đích</h3>
                    <p class="leading-relaxed text-primary">
                        Quy định chính sách giá cước dịch vụ viễn thông di động mạng di động ChoCongNghe.
                    </p>
                </div>
                <div class="mb-4">
                    <h3 class="font-semibold mb-3 text-primary text-lg">II. Phạm vi áp dụng</h3>
                    <p class="leading-relaxed text-primary">
                        Chuỗi cửa hàng ChoCongNghe và các chuỗi Branded Store (F.Studio, S.Studio,…) theo danh sách thông báo từ Ngành hàng.
                    </p>
                </div>
            </div>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-4 text-primary text-xl">B. QUY ĐỊNH CHÍNH SÁCH GIÁ CƯỚC DỊCH VỤ</h2>
            <div class="space-y-4">
                <div class="mb-4">
                    <h3 class="font-semibold mb-3 text-primary text-lg">I. Loại thuê bao</h3>
                    <p class="leading-relaxed text-primary">Áp dụng với thuê bao trả trước.</p>
                </div>

                <div class="mb-4">
                    <h3 class="font-semibold mb-3 text-primary text-lg">II. Thời hạn sử dụng</h3>
                    <ul class="space-y-2">
                        <li class="flex gap-2 leading-relaxed text-primary">
                            <span class="mt-1 shrink-0">•</span>
                            <span>Ngay khi kích hoạt, thuê bao có thời hạn sử dụng là 60 ngày.</span>
                        </li>
                        <li class="flex gap-2 leading-relaxed text-primary">
                            <span class="mt-1 shrink-0">•</span>
                            <span>Khi thực hiện các giao dịch có phát sinh cước, nạp tiền thì thời hạn sử dụng sẽ tăng lên là 90 ngày tính từ ngày phát sinh giao dịch.</span>
                        </li>
                        <li class="flex gap-2 leading-relaxed text-primary">
                            <span class="mt-1 shrink-0">•</span>
                            <span>Trong trường hợp kết thúc thời hạn sử dụng 90 ngày mà thuê bao không thực hiện một trong các giao dịch có phát sinh cước, nạp tiền, thì sẽ chuyển sang trạng thái khóa 1 chiều (khóa chiều đi: thực hiện cuộc gọi, nhắn tin đi và truy cập Internet).</span>
                        </li>
                        <li class="flex gap-2 leading-relaxed text-primary">
                            <span class="mt-1 shrink-0">•</span>
                            <span>Thời hạn khóa 1 chiều là 10 ngày. Hết thời hạn này, nếu thuê bao không nạp tiền thì sẽ chuyển sang trạng thái khóa 2 chiều (chiều đi và chiều đến).</span>
                        </li>
                        <li class="flex gap-2 leading-relaxed text-primary">
                            <span class="mt-1 shrink-0">•</span>
                            <span>Thời hạn khóa 2 chiều (giữ số) là 30 ngày. Hết thời hạn này, nếu thuê bao không nạp tiền thì thuê bao sẽ bị cắt hủy khỏi hệ thống.</span>
                        </li>
                    </ul>
                </div>

                <div class="mb-4">
                    <h3 class="font-semibold mb-3 text-primary text-lg">III. Giá cước</h3>
                    
                    <p class="font-semibold mb-2 text-primary">1. Giá cước hòa mạng</p>
                    <p class="leading-relaxed mb-4 text-primary">
                        Cước hòa mạng thuê bao trả trước: <strong>25.000 đồng/thuê bao</strong> (theo quy định tại Thông tư 14/2012/TT-BTTTT ngày 12 tháng 10 năm 2012 của Bộ Thông tin và Truyền thông).
                    </p>

                    <p class="font-semibold mb-2 text-primary">2. Giá cước thông tin</p>
                    <p class="font-semibold mb-2 text-primary">2.1. Giá cước Thoại và SMS</p>

                    <div class="rounded-lg overflow-hidden border border-neutral mb-4">
                        <div class="grid grid-cols-4 font-semibold px-4 py-2.5 bg-neutral-light-active border-b border-neutral text-primary">
                            <span>Nội dung</span>
                            <span>InZone</span>
                            <span>OutZone</span>
                            <span>Ghi chú</span>
                        </div>
                        <div class="grid grid-cols-4 px-4 py-3 border-b border-neutral last:border-b-0 gap-2">
                            <span class="text-primary">Gọi nội mạng/liên mạng trong nước</span>
                            <span class="text-primary">690đ/phút (6s đầu: 69đ, 1s tiếp: 11,5đ)</span>
                            <span class="text-primary">1.880đ/phút (6s đầu: 188đ, 1s tiếp: 31,33đ)</span>
                            <span class="text-neutral-darker">Block 6s + 1s</span>
                        </div>
                        <div class="grid grid-cols-4 px-4 py-3 border-b border-neutral last:border-b-0 gap-2">
                            <span class="text-primary">Nhắn tin SMS nội mạng/liên mạng</span>
                            <span class="text-primary">250đ/SMS</span>
                            <span class="text-primary">250đ/SMS</span>
                            <span class="text-neutral-darker">Áp dụng trong nước</span>
                        </div>
                    </div>

                    <div class="rounded-lg p-4 bg-neutral-light-active border border-neutral mb-4">
                        <p class="font-semibold mb-2 text-primary">Giải thích InZone / OutZone</p>
                        <ul class="space-y-1">
                            <li class="flex gap-2 leading-relaxed text-neutral-darker">
                                <span class="mt-1 shrink-0">•</span>
                                <span>InZone: Thuê bao liên lạc với số thuê bao phát sinh cuộc gọi và thuê bao nhận cuộc gọi trong vùng đăng ký của thuê bao gọi đi.</span>
                            </li>
                            <li class="flex gap-2 leading-relaxed text-neutral-darker">
                                <span class="mt-1 shrink-0">•</span>
                                <span>OutZone: Với các trường hợp còn lại (bao gồm chuyển vùng trong nước với VinaPhone, gọi video call, số tắt như taxi, Vietnam Airlines...).</span>
                            </li>
                            <li class="flex gap-2 leading-relaxed text-neutral-darker">
                                <span class="mt-1 shrink-0">•</span>
                                <span>Phạm vi Zone tính trong phạm vi 1 tỉnh/thành phố với 63/63 tỉnh thành tại Việt Nam.</span>
                            </li>
                        </ul>
                    </div>

                    <p class="font-semibold mb-2 text-primary">Cú pháp đăng ký / kiểm tra / thay đổi vùng Zone:</p>
                    <div class="rounded-lg overflow-hidden border border-neutral mb-4">
                        <div class="grid grid-cols-4 font-semibold px-4 py-2.5 bg-neutral-light-active border-b border-neutral text-primary">
                            <span>Nghiệp vụ</span>
                            <span>Cú pháp</span>
                            <span>Đầu số</span>
                            <span>Cước phí</span>
                        </div>
                        <div class="grid grid-cols-4 px-4 py-3 border-b border-neutral last:border-b-0">
                            <span class="text-primary">Đăng ký vùng</span>
                            <span class="font-semibold text-accent">DK_FPT_Tên tỉnh</span>
                            <span class="text-primary">9199</span>
                            <span class="text-primary">Miễn phí</span>
                        </div>
                        <div class="grid grid-cols-4 px-4 py-3 border-b border-neutral last:border-b-0">
                            <span class="text-primary">Kiểm tra vùng</span>
                            <span class="font-semibold text-accent">KT_FPT</span>
                            <span class="text-primary">9199</span>
                            <span class="text-primary">Miễn phí</span>
                        </div>
                        <div class="grid grid-cols-4 px-4 py-3 border-b border-neutral last:border-b-0">
                            <span class="text-primary">Chuyển vùng lần đầu sau kích hoạt</span>
                            <span class="font-semibold text-accent">DOI_FPT_Tên tỉnh</span>
                            <span class="text-primary">9199</span>
                            <span class="text-primary">Miễn phí</span>
                        </div>
                        <div class="grid grid-cols-4 px-4 py-3 border-b border-neutral last:border-b-0">
                            <span class="text-primary">Chuyển vùng từ lần 2 trở đi</span>
                            <span class="font-semibold text-accent">DOI_FPT_Tên tỉnh</span>
                            <span class="text-primary">9199</span>
                            <span class="text-primary">20.000đ/lần</span>
                        </div>
                    </div>

                    <p class="font-semibold mb-2 text-primary">2.2. Giá cước Data</p>
                    <p class="leading-relaxed mb-4 text-primary">
                        Giá cước đối với thuê bao không có gói cước hoặc gói cước hết thời gian sử dụng: <strong>75 đồng/50KB</strong>. Trường hợp thuê bao đăng ký gói cước, áp dụng theo quy định cụ thể của từng gói cước. Để xem chi tiết các gói cước, vui lòng liên hệ hotline <strong>1800.6060</strong> hoặc <strong>1800.6626</strong>.
                    </p>

                    <p class="font-semibold mb-2 text-primary">3. Nguyên tắc tính cước</p>
                    <div class="space-y-3">
                        <div class="mb-4">
                            <h3 class="font-semibold mb-3 text-primary">3.1. Nguyên tắc tính cước Thoại</h3>
                            <ul class="space-y-1">
                                <li class="flex gap-2 leading-relaxed text-neutral-darker">
                                    <span class="mt-1 shrink-0">•</span>
                                    <span>Tính cước cuộc gọi theo block 6 giây + block 1 giây, bắt đầu từ giây đầu tiên.</span>
                                </li>
                                <li class="flex gap-2 leading-relaxed text-neutral-darker">
                                    <span class="mt-1 shrink-0">•</span>
                                    <span>Cuộc gọi nội mạng: khi thuê bao di động ChoCongNghe gọi đến thuê bao khác cũng thuộc mạng ChoCongNghe và mạng MobiFone.</span>
                                </li>
                                <li class="flex gap-2 leading-relaxed text-neutral-darker">
                                    <span class="mt-1 shrink-0">•</span>
                                    <span>Cuộc gọi liên mạng: khi thuê bao di động ChoCongNghe gọi đến thuê bao di động, cố định thuộc các mạng viễn thông khác.</span>
                                </li>
                                <li class="flex gap-2 leading-relaxed text-neutral-darker">
                                    <span class="mt-1 shrink-0">•</span>
                                    <span>Nguyên tắc làm tròn: phần lẻ &lt;5 làm tròn xuống 0; ≥5 làm tròn lên 1. Cước phát sinh làm tròn theo tổng số tiền của từng cuộc gọi/tin nhắn/giao dịch.</span>
                                </li>
                            </ul>
                        </div>
                        <div class="mb-4">
                            <h3 class="font-semibold mb-3 text-primary">3.2. Nguyên tắc tính cước SMS</h3>
                            <ul class="space-y-1">
                                <li class="flex gap-2 leading-relaxed text-neutral-darker">
                                    <span class="mt-1 shrink-0">•</span>
                                    <span>Khi tin nhắn gửi thành công đến trung tâm tin nhắn của nhà mạng (SMSC), thuê bao trừ tiền vào tài khoản thưởng trước (nếu có), sau đó trừ tài khoản chính.</span>
                                </li>
                                <li class="flex gap-2 leading-relaxed text-neutral-darker">
                                    <span class="mt-1 shrink-0">•</span>
                                    <span>SMS nội mạng: áp dụng cho tin nhắn từ thuê bao mạng ChoCongNghe đến thuê bao thuộc mạng ChoCongNghe, MobiFone, Saymee và các mạng MVNO hợp tác với MobiFone.</span>
                                </li>
                                <li class="flex gap-2 leading-relaxed text-neutral-darker">
                                    <span class="mt-1 shrink-0">•</span>
                                    <span>SMS liên mạng: áp dụng cho tin nhắn đến thuê bao các mạng điện thoại khác.</span>
                                </li>
                            </ul>
                        </div>
                        <div class="mb-4">
                            <h3 class="font-semibold mb-3 text-primary">3.3. Nguyên tắc tính cước Data</h3>
                            <ul class="space-y-1">
                                <li class="flex gap-2 leading-relaxed text-neutral-darker">
                                    <span class="mt-1 shrink-0">•</span>
                                    <span>Thuê bao truy nhập Internet trừ tiền vào tài khoản chính theo dung lượng sử dụng và theo quy định của từng gói cước.</span>
                                </li>
                                <li class="flex gap-2 leading-relaxed text-neutral-darker">
                                    <span class="mt-1 shrink-0">•</span>
                                    <span>Dung lượng sử dụng được tính trên tổng dung lượng download và upload.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="mb-4">
                    <h3 class="font-semibold mb-3 text-primary text-lg">IV. Quy định các gói cước</h3>
                    <p class="leading-relaxed text-primary">
                        Để xem chi tiết danh sách các gói cước hiện hành, Quý khách vui lòng liên hệ nhân viên tại cửa hàng ChoCongNghe hoặc gọi hotline <strong>1800.6060</strong>.
                    </p>
                </div>

                <div class="mb-4">
                    <h3 class="font-semibold mb-3 text-primary text-lg">V. Các dịch vụ giá trị gia tăng</h3>
                    <p class="font-semibold mb-2 text-primary">1. Dịch vụ Nhạc chuông chờ – Funring</p>
                    <p class="leading-relaxed mb-3 text-primary">
                        FunRing là dịch vụ nhạc chờ dành cho thuê bao ChoCongNghe. Khi thuê bao khác gọi đến, thuê bao gọi đến sẽ được nghe những bản nhạc chờ do khách hàng lựa chọn.
                    </p>
                    <div class="rounded-lg overflow-hidden border border-neutral mb-5">
                        <div class="grid grid-cols-3 font-semibold px-4 py-2.5 bg-neutral-light-active border-b border-neutral text-primary">
                            <span>Thực hiện</span>
                            <span>Cách đăng ký</span>
                            <span>Lưu ý</span>
                        </div>
                        <div class="grid grid-cols-3 px-4 py-3 border-b border-neutral last:border-b-0 gap-2">
                            <span class="font-semibold text-primary">Đăng ký</span>
                            <span class="font-semibold text-accent whitespace-pre-line">Soạn DK gửi 9224 (12.000đ/30 ngày)<br>hoặc DKY 1 gửi 9224 (1.000đ/ngày)</span>
                            <span class="text-neutral-darker">Được miễn phí 1 bản nhạc chờ mặc định do hệ thống lựa chọn (nhạc không lời)</span>
                        </div>
                        <div class="grid grid-cols-3 px-4 py-3 border-b border-neutral last:border-b-0 gap-2">
                            <span class="font-semibold text-primary">Tải nhạc chờ</span>
                            <span class="font-semibold text-accent whitespace-pre-line">Soạn CHON_&lt;Mã bài hát&gt; gửi 9224</span>
                            <span class="text-neutral-darker">Nhạc chờ được phát mặc định là nhạc chờ cuối cùng tải về</span>
                        </div>
                        <div class="grid grid-cols-3 px-4 py-3 border-b border-neutral last:border-b-0 gap-2">
                            <span class="font-semibold text-primary">Hủy dịch vụ</span>
                            <span class="font-semibold text-accent whitespace-pre-line">Soạn HUY gửi 9224</span>
                            <span class="text-neutral-darker">Dịch vụ Funring hủy, tất cả bài hát trong thư viện nhạc chờ tự động xóa</span>
                        </div>
                    </div>

                    <p class="font-semibold mb-2 text-primary">2. Dịch vụ Thông báo cuộc gọi nhỡ – MCA</p>
                    <p class="leading-relaxed mb-3 text-primary">
                        Dịch vụ MCA giúp khách hàng biết thông tin về các cuộc gọi nhỡ khi điện thoại đang tắt máy, hết pin hoặc ngoài vùng phủ sóng.
                    </p>
                    <div class="rounded-lg overflow-hidden border border-neutral mb-5">
                        <div class="grid grid-cols-4 font-semibold px-4 py-2.5 bg-neutral-light-active border-b border-neutral text-primary">
                            <span>Cách đăng ký</span>
                            <span>Mức cước</span>
                            <span>Thời gian</span>
                            <span>Cách hủy</span>
                        </div>
                        <div class="grid grid-cols-4 px-4 py-3 border-b border-neutral last:border-b-0">
                            <span class="font-semibold text-accent">DK MCAP7 gửi 9232</span>
                            <span class="text-primary">2.500đ</span>
                            <span class="text-primary">7 ngày</span>
                            <span class="font-semibold text-accent">HUY gửi 9232</span>
                        </div>
                        <div class="grid grid-cols-4 px-4 py-3 border-b border-neutral last:border-b-0">
                            <span class="font-semibold text-accent">DK MCAP gửi 9232</span>
                            <span class="text-primary">9.000đ</span>
                            <span class="text-primary">30 ngày</span>
                            <span class="font-semibold text-accent">HUY gửi 9232</span>
                        </div>
                    </div>
                </div>

                <div class="mb-4">
                    <h3 class="font-semibold mb-3 text-primary text-lg">VI. Dịch vụ quốc tế</h3>
                    <p class="font-semibold mb-2 text-primary">1. Dịch vụ Thoại/SMS quốc tế</p>
                    <ul class="space-y-2 mb-4">
                        <li class="flex gap-2 leading-relaxed text-primary">
                            <span class="mt-1 shrink-0">•</span>
                            <span>Gọi thoại quốc tế – Cách 1 (IDD): <strong>00 + Mã nước + Mã vùng + SĐT</strong></span>
                        </li>
                        <li class="flex gap-2 leading-relaxed text-primary">
                            <span class="mt-1 shrink-0">•</span>
                            <span>Gọi thoại quốc tế – Cách 2 (VOIP 131): <strong>131 + 00 + Mã nước + Mã vùng + SĐT</strong></span>
                        </li>
                        <li class="flex gap-2 leading-relaxed text-primary">
                            <span class="mt-1 shrink-0">•</span>
                            <span>Nhắn tin SMS quốc tế: <strong>00 + Mã nước + Mã vùng + SĐT</strong> (tối đa 160 ký tự không dấu / 70 ký tự có dấu, giá 2.500đ/SMS)</span>
                        </li>
                    </ul>

                    <p class="font-semibold mb-2 text-primary">2. Dịch vụ chuyển vùng quốc tế (CVQT)</p>
                    <div class="space-y-3 mb-4">
                        <div class="pl-4 border-l-[3px] border-accent">
                            <p class="font-semibold mb-1 text-neutral-darker">Bước 1: Đăng ký CVQT</p>
                            <p class="text-primary">→ Chỉ Thoại & SMS: <strong>DK CVQT</strong> gửi 9199 hoặc bấm <strong>*093*1*1#</strong></p>
                            <p class="text-primary">→ Thoại, SMS & Data: <strong>DK CVQT ALL</strong> gửi 9199 hoặc bấm <strong>*093*2*1#</strong></p>
                        </div>
                        <div class="pl-4 border-l-[3px] border-accent">
                            <p class="font-semibold mb-1 text-neutral-darker">Bước 2: Bật Data Roaming trên điện thoại</p>
                            <p class="text-primary">→ iOS: Settings → Cellular Data Option → Roaming ON → Data Roaming ON</p>
                            <p class="text-primary">→ Android: Settings → Connections → Mobile Networks → Access Point Names → Roaming ON</p>
                        </div>
                        <div class="pl-4 border-l-[3px] border-accent">
                            <p class="font-semibold mb-1 text-neutral-darker">Bước 3: Đăng ký gói cước quốc tế</p>
                            <p class="text-primary">→ Soạn <strong>DK [Tên gói]</strong> gửi 9199. Để xem danh sách gói cước CVQT, vui lòng liên hệ hotline <strong>1800.6060</strong>.</p>
                        </div>
                        <div class="pl-4 border-l-[3px] border-accent">
                            <p class="font-semibold mb-1 text-neutral-darker">Hủy dịch vụ CVQT</p>
                            <p class="text-primary">→ Hủy Data: <strong>HUY CVQT DATA</strong> gửi 9199</p>
                            <p class="text-primary">→ Hủy toàn bộ: <strong>HUY CVQT ALL</strong> gửi 9199 hoặc bấm <strong>*093*2*2#</strong></p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-4 text-primary text-xl">C. CÔNG BỐ CHẤT LƯỢNG DỊCH VỤ</h2>
            <div class="space-y-4">
                <div class="mb-4">
                    <h3 class="font-semibold mb-3 text-primary text-lg">I. Dịch vụ được cung cấp</h3>
                    <div class="rounded-lg overflow-hidden border border-neutral mb-4">
                        <div class="grid grid-cols-3 font-semibold px-4 py-2.5 bg-neutral-light-active border-b border-neutral text-primary">
                            <span>STT</span>
                            <span>Dịch vụ</span>
                            <span>Địa bàn</span>
                        </div>
                        <div class="grid grid-cols-3 px-4 py-3 border-b border-neutral last:border-b-0">
                            <span class="text-primary">1</span>
                            <span class="text-primary">Dịch vụ điện thoại trên mạng viễn thông di động mặt đất</span>
                            <span class="text-primary">Toàn Quốc</span>
                        </div>
                        <div class="grid grid-cols-3 px-4 py-3 border-b border-neutral last:border-b-0">
                            <span class="text-primary">2</span>
                            <span class="text-primary">Dịch vụ tin nhắn ngắn trên mạng viễn thông di động mặt đất</span>
                            <span class="text-primary">Toàn Quốc</span>
                        </div>
                        <div class="grid grid-cols-3 px-4 py-3 border-b border-neutral last:border-b-0">
                            <span class="text-primary">3</span>
                            <span class="text-primary">Dịch vụ truy cập Internet trên mạng viễn thông di động mặt đất</span>
                            <span class="text-primary">Toàn Quốc</span>
                        </div>
                    </div>
                </div>

                <div class="mb-4">
                    <h3 class="font-semibold mb-3 text-primary text-lg">II. Quy chuẩn kỹ thuật áp dụng</h3>
                    <ul class="space-y-2">
                        <li class="flex gap-2 leading-relaxed text-primary">
                            <span class="mt-1 shrink-0">•</span>
                            <span>QCVN 36:2022/BTTTT – Quy chuẩn kỹ thuật quốc gia về dịch vụ điện thoại trên mạng thông tin di động mặt đất.</span>
                        </li>
                        <li class="flex gap-2 leading-relaxed text-primary">
                            <span class="mt-1 shrink-0">•</span>
                            <span>QCVN 81:2019/BTTTT – Quy chuẩn kỹ thuật quốc gia về dịch vụ truy nhập Internet trên mạng viễn thông di động mặt đất.</span>
                        </li>
                        <li class="flex gap-2 leading-relaxed text-primary">
                            <span class="mt-1 shrink-0">•</span>
                            <span>QCVN 82:2014/BTTTT – Quy chuẩn kỹ thuật quốc gia về dịch vụ tin nhắn ngắn trên mạng thông tin di động mặt đất.</span>
                        </li>
                    </ul>
                </div>

                <div class="mb-4">
                    <h3 class="font-semibold mb-3 text-primary text-lg">III. Báo cáo định kỳ về chất lượng</h3>
                    <p class="leading-relaxed mb-3 text-primary">
                        Để xem báo cáo định kỳ chất lượng dịch vụ thoại và Internet, Quý khách vui lòng liên hệ trực tiếp tại cửa hàng ChoCongNghe gần nhất hoặc gọi hotline <strong>1800.6060</strong> để được cung cấp thông tin chi tiết theo từng quý.
                    </p>
                    <div class="rounded-lg p-4 bg-neutral-light-active border border-neutral">
                        <p class="font-semibold mb-2 text-primary">Các quý có sẵn báo cáo:</p>
                        <p class="text-neutral-darker">Quý I, II, III, IV năm 2024 và Quý I, II, III, IV năm 2025 (Dịch vụ thoại & Dịch vụ Internet).</p>
                    </div>
                </div>
            </div>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-4 text-primary text-xl">D. QUY TRÌNH GIAO KẾT HỢP ĐỒNG THEO MẪU</h2>
            <div class="space-y-4">
                <div class="mb-4">
                    <h3 class="font-semibold mb-3 text-primary text-lg">I. Thủ tục đăng ký thông tin thuê bao trả trước</h3>
                    <p class="font-semibold mb-2 text-primary">1. Thuê bao là cá nhân</p>
                    <ul class="space-y-2 mb-4">
                        <li class="flex gap-2 leading-relaxed text-primary">
                            <span class="mt-1 shrink-0">•</span>
                            <span>Giấy tờ tùy thân bản chính (CMND, CCCD hoặc Hộ chiếu còn hiệu lực đối với người Việt Nam; Hộ chiếu còn hiệu lực lưu hành tại Việt Nam đối với người nước ngoài).</span>
                        </li>
                        <li class="flex gap-2 leading-relaxed text-primary">
                            <span class="mt-1 shrink-0">•</span>
                            <span>Đối với người dưới 14 tuổi hoặc người được giám hộ, việc giao kết hợp đồng phải do cha, mẹ hoặc người giám hộ thực hiện.</span>
                        </li>
                        <li class="flex gap-2 leading-relaxed text-primary">
                            <span class="mt-1 shrink-0">•</span>
                            <span>Lưu ý: Mỗi cá nhân được hòa mạng tối đa 09 thuê bao/giấy tờ.</span>
                        </li>
                    </ul>
                    <p class="font-semibold mb-2 text-primary">2. Thuê bao là tổ chức</p>
                    <ul class="space-y-2">
                        <li class="flex gap-2 leading-relaxed text-primary">
                            <span class="mt-1 shrink-0">•</span>
                            <span>Giấy tờ chứng nhận pháp nhân (bản chính hoặc bản sao chứng thực): Quyết định thành lập, Giấy chứng nhận đăng ký kinh doanh, Giấy phép đầu tư hoặc Giấy chứng nhận đăng ký doanh nghiệp.</span>
                        </li>
                        <li class="flex gap-2 leading-relaxed text-primary">
                            <span class="mt-1 shrink-0">•</span>
                            <span>Danh sách các cá nhân thuộc tổ chức được phép sử dụng dịch vụ (có xác nhận hợp pháp, ký bởi Người đại diện theo pháp luật và đóng dấu của tổ chức), kèm theo bản chính giấy tờ tùy thân của từng cá nhân.</span>
                        </li>
                        <li class="flex gap-2 leading-relaxed text-primary">
                            <span class="mt-1 shrink-0">•</span>
                            <span>Văn bản ủy quyền hợp pháp và giấy tờ tùy thân của người đại diện (nếu người đến giao kết không phải Người đại diện theo pháp luật).</span>
                        </li>
                    </ul>
                </div>

                <div class="mb-4">
                    <h3 class="font-semibold mb-3 text-primary text-lg">II. Quy trình giao kết</h3>
                    <ol class="space-y-3">
                        <li class="flex items-start gap-3 text-primary">
                            <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent text-white mt-0.5">1</span>
                            <span class="leading-relaxed">Khách hàng đến Điểm cung cấp dịch vụ viễn thông (ĐCCDV), cung cấp các giấy tờ cần thiết.</span>
                        </li>
                        <li class="flex items-start gap-3 text-primary">
                            <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent text-white mt-0.5">2</span>
                            <span class="leading-relaxed">ĐCCDV kiểm tra, đối chiếu giấy tờ và nhập đầy đủ, chính xác thông tin thuê bao theo quy định.</span>
                        </li>
                        <li class="flex items-start gap-3 text-primary">
                            <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent text-white mt-0.5">3</span>
                            <span class="leading-relaxed">ĐCCDV chụp và lưu bản số hóa toàn bộ giấy tờ và ảnh chụp người đến giao kết.</span>
                        </li>
                        <li class="flex items-start gap-3 text-primary">
                            <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent text-white mt-0.5">4</span>
                            <span class="leading-relaxed">Khách hàng ký xác nhận vào Hợp đồng cung cấp và sử dụng dịch vụ viễn thông di động mặt đất hình thức trả trước.</span>
                        </li>
                        <li class="flex items-start gap-3 text-primary">
                            <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent text-white mt-0.5">5</span>
                            <span class="leading-relaxed">ĐCCDV đăng ký thông tin thuê bao lên hệ thống và truyền hồ sơ số hóa về cơ sở dữ liệu tập trung.</span>
                        </li>
                        <li class="flex items-start gap-3 text-primary">
                            <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent text-white mt-0.5">6</span>
                            <span class="leading-relaxed">Kích hoạt thuê bao.</span>
                        </li>
                    </ol>
                </div>
            </div>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-4 text-primary text-xl">E. QUY TRÌNH TIẾP NHẬN VÀ GIẢI QUYẾT KHIẾU NẠI</h2>
            <div class="space-y-4">
                <div class="mb-4">
                    <h3 class="font-semibold mb-3 text-primary text-lg">Điều 1: Cơ chế giải quyết</h3>
                    <p class="leading-relaxed text-primary">
                        Trong trường hợp xảy ra sự cố do lỗi, chúng tôi sẽ ngay lập tức áp dụng các biện pháp cần thiết để đảm bảo quyền lợi cho khách hàng.
                    </p>
                </div>
                <div class="mb-4">
                    <h3 class="font-semibold mb-3 text-primary text-lg">Điều 2: Phương thức gửi phản ánh</h3>
                    <ul class="space-y-2">
                        <li class="flex gap-2 leading-relaxed text-primary">
                            <span class="mt-1 shrink-0">•</span>
                            <span>Gọi điện thoại tới hotline: <strong>1800.6060</strong> hoặc <strong>1800.6626</strong></span>
                        </li>
                        <li class="flex gap-2 leading-relaxed text-primary">
                            <span class="mt-1 shrink-0">•</span>
                            <span>Gửi email tới: <strong>chocongnghe@chocongnghe.vn</strong></span>
                        </li>
                        <li class="flex gap-2 leading-relaxed text-primary">
                            <span class="mt-1 shrink-0">•</span>
                            <span>Qua website: <strong>chocongnghe.vn</strong></span>
                        </li>
                        <li class="flex gap-2 leading-relaxed text-primary">
                            <span class="mt-1 shrink-0">•</span>
                            <span>Văn bản, đơn thư gửi trực tiếp tại cửa hàng ChoCongNghe gần nhất.</span>
                        </li>
                    </ul>
                </div>
                <div class="mb-4">
                    <h3 class="font-semibold mb-3 text-primary text-lg">Điều 3: Trình tự thực hiện</h3>
                    <ol class="space-y-3">
                        <li class="flex items-start gap-3 text-primary">
                            <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent text-white mt-0.5">1</span>
                            <div>
                                <p class="font-semibold">Gửi phản ánh</p>
                                <p class="leading-relaxed text-neutral-darker">Khách hàng gửi phản ánh về dịch vụ hoặc quyền lợi chưa được đảm bảo đầy đủ tới ChoCongNghe qua các phương thức nêu trên.</p>
                            </div>
                        </li>
                        <li class="flex items-start gap-3 text-primary">
                            <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent text-white mt-0.5">2</span>
                            <div>
                                <p class="font-semibold">Tiếp nhận và xử lý</p>
                                <p class="leading-relaxed text-neutral-darker">ChoCongNghe sẽ tiếp nhận phản ánh và tiến hành xác minh thông tin.</p>
                            </div>
                        </li>
                        <li class="flex items-start gap-3 text-primary">
                            <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent text-white mt-0.5">3</span>
                            <div>
                                <p class="font-semibold">Phản hồi tới khách hàng</p>
                                <p class="leading-relaxed text-neutral-darker">ChoCongNghe sẽ phản hồi kết quả xử lý trong thời hạn 7 – 10 ngày làm việc kể từ ngày xác minh, xử lý thông tin được hoàn thành.</p>
                            </div>
                        </li>
                    </ol>
                </div>
            </div>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-4 text-primary text-xl">F. DANH SÁCH ĐIỂM CUNG CẤP DỊCH VỤ VIỄN THÔNG</h2>
            <div class="space-y-4">
                <p class="leading-relaxed text-primary">
                    Quý khách có thể tìm cửa hàng ChoCongNghe gần nhất bằng cách liên hệ hotline <strong>1800.6060</strong> hoặc truy cập website <strong>chocongnghe.vn</strong> mục "Hệ thống cửa hàng".
                </p>
            </div>
        </section>

        <hr class="my-6 border-neutral" />

        <section class="mb-6">
            <h2 class="font-bold mb-4 text-primary text-xl">G. ĐIỀU KIỆN GIAO DỊCH CHUNG</h2>
            <div class="space-y-4">
                <p class="leading-relaxed text-primary">
                    Điều kiện giao dịch chung đối với dịch vụ viễn thông di động mặt đất hình thức trả trước được cung cấp tại cửa hàng ChoCongNghe và trên website <strong>chocongnghe.vn</strong>. Quý khách vui lòng liên hệ hotline <strong>1800.6060</strong> hoặc nhân viên cửa hàng để được tư vấn chi tiết.
                </p>
            </div>
        </section>

    </div>
  `.trim()
};