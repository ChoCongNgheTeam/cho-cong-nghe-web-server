import { PageType } from "@prisma/client";
import { PageSeedData } from "../types";

export const shoppingGuidePage: PageSeedData = {
  title: "Hướng dẫn Mua hàng & Thanh toán",
  slug: "huong-dan-mua-hang",
  type: PageType.PAGE,
  policyType: null,
  isPublished: true,
  priority: 8,
//   metaTitle: "Hướng dẫn mua hàng và thanh toán online tại ChoCongNghe",
//   metaDescription: "Hướng dẫn chi tiết 4 bước đặt hàng đơn giản, các phương thức thanh toán linh hoạt và giải đáp các câu hỏi thường gặp khi mua sắm tại ChoCongNghe.",
  content: `
    <div class="min-h-screen bg-stone-50 w-full rounded-2xl overflow-hidden">
        
        <div class="bg-stone-900 text-white relative overflow-hidden">
            <div class="absolute inset-0 bg-linear-to-br from-amber-900/20 via-transparent to-stone-900/80"></div>
            <div class="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-amber-500/50 to-transparent"></div>

            <div class="relative max-w-3xl mx-auto px-6 py-16 text-center">
                <div class="inline-flex items-center gap-2 border border-amber-500/30 text-amber-400 text-xs tracking-widest uppercase px-4 py-1.5 rounded-full mb-6">
                    <span>✦</span> Trung tâm hỗ trợ
                </div>

                <h1 class="font-serif text-4xl md:text-5xl font-black leading-tight mb-4">
                    Hướng dẫn <span class="italic text-amber-400">Mua hàng</span><br>& Thanh toán Online
                </h1>

                <p class="text-stone-400 text-sm max-w-md mx-auto leading-relaxed">
                    Mua sắm dễ dàng, an toàn và tiện lợi. Chúng tôi hỗ trợ bạn từng bước từ khi chọn sản phẩm đến khi nhận hàng.
                </p>

                <div class="flex flex-wrap justify-center gap-8 mt-10 pt-10 border-t border-stone-700">
                    <div class="text-center">
                        <div class="font-serif text-2xl font-black text-amber-400">4 bước</div>
                        <div class="text-xs text-stone-500 mt-0.5">Đặt hàng đơn giản</div>
                    </div>
                    <div class="text-center">
                        <div class="font-serif text-2xl font-black text-amber-400">3 hình thức</div>
                        <div class="text-xs text-stone-500 mt-0.5">Thanh toán linh hoạt</div>
                    </div>
                    <div class="text-center">
                        <div class="font-serif text-2xl font-black text-amber-400">24/7</div>
                        <div class="text-xs text-stone-500 mt-0.5">Hỗ trợ khách hàng</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="container mx-auto px-6 py-12">
            
            <div class="mb-16">
                <h2 class="text-2xl font-bold text-stone-800 mb-8 flex items-center gap-3">
                    <span class="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm">1</span> 
                    Quy trình mua hàng
                </h2>
                
                <div class="grid gap-6">
                    <div class="group relative bg-white rounded-2xl border border-stone-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                        <div class="absolute top-0 left-0 w-1 h-full bg-amber-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top rounded-l-2xl"></div>
                        <div class="flex gap-5">
                            <div class="shrink-0">
                                <div class="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-2xl">🛒</div>
                            </div>
                            <div class="flex-1">
                                <div class="flex items-center gap-3 mb-2">
                                    <span class="font-serif text-3xl font-black text-stone-200 leading-none">01</span>
                                    <h3 class="font-semibold text-stone-800 text-base">Chọn sản phẩm</h3>
                                </div>
                                <p class="text-stone-500 text-sm leading-relaxed mb-4">Duyệt danh mục và chọn sản phẩm phù hợp với nhu cầu của bạn.</p>
                                <ul class="space-y-1.5">
                                    <li class="flex items-start gap-2 text-sm text-stone-600"><span class="mt-0.5 text-amber-500 shrink-0">›</span>Xem kỹ mô tả sản phẩm</li>
                                    <li class="flex items-start gap-2 text-sm text-stone-600"><span class="mt-0.5 text-amber-500 shrink-0">›</span>Kiểm tra đánh giá từ khách hàng</li>
                                    <li class="flex items-start gap-2 text-sm text-stone-600"><span class="mt-0.5 text-amber-500 shrink-0">›</span>Chọn đúng màu sắc / size</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="group relative bg-white rounded-2xl border border-stone-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                        <div class="absolute top-0 left-0 w-1 h-full bg-amber-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top rounded-l-2xl"></div>
                        <div class="flex gap-5">
                            <div class="shrink-0">
                                <div class="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-2xl">🧾</div>
                            </div>
                            <div class="flex-1">
                                <div class="flex items-center gap-3 mb-2">
                                    <span class="font-serif text-3xl font-black text-stone-200 leading-none">02</span>
                                    <h3 class="font-semibold text-stone-800 text-base">Thêm vào giỏ hàng</h3>
                                </div>
                                <p class="text-stone-500 text-sm leading-relaxed mb-4">Thêm sản phẩm vào giỏ và kiểm tra lại thông tin trước khi thanh toán.</p>
                                <ul class="space-y-1.5">
                                    <li class="flex items-start gap-2 text-sm text-stone-600"><span class="mt-0.5 text-amber-500 shrink-0">›</span>Kiểm tra số lượng</li>
                                    <li class="flex items-start gap-2 text-sm text-stone-600"><span class="mt-0.5 text-amber-500 shrink-0">›</span>Áp dụng mã giảm giá nếu có</li>
                                    <li class="flex items-start gap-2 text-sm text-stone-600"><span class="mt-0.5 text-amber-500 shrink-0">›</span>Xem lại tổng tiền</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="group relative bg-white rounded-2xl border border-stone-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                        <div class="absolute top-0 left-0 w-1 h-full bg-amber-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top rounded-l-2xl"></div>
                        <div class="flex gap-5">
                            <div class="shrink-0">
                                <div class="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-2xl">📍</div>
                            </div>
                            <div class="flex-1">
                                <div class="flex items-center gap-3 mb-2">
                                    <span class="font-serif text-3xl font-black text-stone-200 leading-none">03</span>
                                    <h3 class="font-semibold text-stone-800 text-base">Nhập thông tin nhận hàng</h3>
                                </div>
                                <p class="text-stone-500 text-sm leading-relaxed mb-4">Điền đầy đủ thông tin để đảm bảo giao hàng chính xác.</p>
                                <ul class="space-y-1.5">
                                    <li class="flex items-start gap-2 text-sm text-stone-600"><span class="mt-0.5 text-amber-500 shrink-0">›</span>Nhập đúng số điện thoại</li>
                                    <li class="flex items-start gap-2 text-sm text-stone-600"><span class="mt-0.5 text-amber-500 shrink-0">›</span>Ghi rõ địa chỉ cụ thể</li>
                                    <li class="flex items-start gap-2 text-sm text-stone-600"><span class="mt-0.5 text-amber-500 shrink-0">›</span>Thêm ghi chú nếu cần</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="group relative bg-white rounded-2xl border border-stone-200 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                        <div class="absolute top-0 left-0 w-1 h-full bg-amber-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top rounded-l-2xl"></div>
                        <div class="flex gap-5">
                            <div class="shrink-0">
                                <div class="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-2xl">💳</div>
                            </div>
                            <div class="flex-1">
                                <div class="flex items-center gap-3 mb-2">
                                    <span class="font-serif text-3xl font-black text-stone-200 leading-none">04</span>
                                    <h3 class="font-semibold text-stone-800 text-base">Thanh toán</h3>
                                </div>
                                <p class="text-stone-500 text-sm leading-relaxed mb-4">Chọn phương thức thanh toán phù hợp và hoàn tất đơn hàng.</p>
                                <ul class="space-y-1.5">
                                    <li class="flex items-start gap-2 text-sm text-stone-600"><span class="mt-0.5 text-amber-500 shrink-0">›</span>Chọn phương thức phù hợp</li>
                                    <li class="flex items-start gap-2 text-sm text-stone-600"><span class="mt-0.5 text-amber-500 shrink-0">›</span>Kiểm tra lại đơn hàng</li>
                                    <li class="flex items-start gap-2 text-sm text-stone-600"><span class="mt-0.5 text-amber-500 shrink-0">›</span>Xác nhận thanh toán</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mb-16">
                <h2 class="text-2xl font-bold text-stone-800 mb-8 flex items-center gap-3">
                    <span class="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm">2</span> 
                    Phương thức thanh toán
                </h2>
                
                <div class="grid md:grid-cols-3 gap-6">
                    <div class="bg-white rounded-2xl border border-stone-200 p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                        <div class="flex items-start justify-between mb-3">
                            <div class="flex items-center gap-3">
                                <span class="text-3xl">💵</span>
                                <h3 class="font-semibold text-stone-800 text-sm leading-tight">Thanh toán khi nhận hàng (COD)</h3>
                            </div>
                            <span class="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full shrink-0 ml-2 bg-green-100 text-green-700">Phổ biến</span>
                        </div>
                        <p class="text-stone-500 text-sm leading-relaxed mb-4">Thanh toán trực tiếp cho nhân viên giao hàng khi nhận sản phẩm.</p>
                        <ul class="space-y-1.5 mb-3">
                            <li class="flex items-center gap-2 text-sm text-stone-600">
                                <span class="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs shrink-0">✓</span>Không cần thanh toán trước
                            </li>
                            <li class="flex items-center gap-2 text-sm text-stone-600">
                                <span class="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs shrink-0">✓</span>An toàn, dễ sử dụng
                            </li>
                        </ul>
                        <div class="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-auto">
                            <span class="text-amber-500 text-xs mt-0.5 shrink-0">⚠</span>
                            <p class="text-amber-700 text-xs">Chuẩn bị tiền mặt chính xác để giao dịch nhanh hơn</p>
                        </div>
                    </div>

                    <div class="bg-white rounded-2xl border border-stone-200 p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                        <div class="flex items-start justify-between mb-3">
                            <div class="flex items-center gap-3">
                                <span class="text-3xl">🏦</span>
                                <h3 class="font-semibold text-stone-800 text-sm leading-tight">Chuyển khoản ngân hàng</h3>
                            </div>
                            <span class="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full shrink-0 ml-2 bg-blue-100 text-blue-700">Tiết kiệm</span>
                        </div>
                        <p class="text-stone-500 text-sm leading-relaxed mb-4">Chuyển khoản trực tiếp qua tài khoản ngân hàng của cửa hàng.</p>
                        <ul class="space-y-1.5 mb-3">
                            <li class="flex items-center gap-2 text-sm text-stone-600">
                                <span class="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs shrink-0">✓</span>Không cần tiền mặt
                            </li>
                            <li class="flex items-center gap-2 text-sm text-stone-600">
                                <span class="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs shrink-0">✓</span>Xử lý nhanh
                            </li>
                        </ul>
                        <div class="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-auto">
                            <span class="text-amber-500 text-xs mt-0.5 shrink-0">⚠</span>
                            <p class="text-amber-700 text-xs">Ghi đúng nội dung chuyển khoản để xác nhận đơn</p>
                        </div>
                    </div>

                    <div class="bg-white rounded-2xl border border-stone-200 p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                        <div class="flex items-start justify-between mb-3">
                            <div class="flex items-center gap-3">
                                <span class="text-3xl">📱</span>
                                <h3 class="font-semibold text-stone-800 text-sm leading-tight">Ví điện tử</h3>
                            </div>
                            <span class="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full shrink-0 ml-2 bg-purple-100 text-purple-700">Tiện lợi</span>
                        </div>
                        <p class="text-stone-500 text-sm leading-relaxed mb-4">Thanh toán qua Momo, ZaloPay, VNPay...</p>
                        <ul class="space-y-1.5 mb-3">
                            <li class="flex items-center gap-2 text-sm text-stone-600">
                                <span class="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs shrink-0">✓</span>Thanh toán nhanh chóng
                            </li>
                            <li class="flex items-center gap-2 text-sm text-stone-600">
                                <span class="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs shrink-0">✓</span>Nhiều ưu đãi
                            </li>
                        </ul>
                        <div class="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-auto">
                            <span class="text-amber-500 text-xs mt-0.5 shrink-0">⚠</span>
                            <p class="text-amber-700 text-xs">Đảm bảo ví đủ số dư</p>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h2 class="text-2xl font-bold text-stone-800 mb-8 flex items-center gap-3">
                    <span class="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm">3</span> 
                    Câu hỏi thường gặp
                </h2>
                
                <div class="space-y-4">
                    <details class="group border border-stone-200 rounded-xl overflow-hidden bg-white [&::-webkit-details-marker]:hidden cursor-pointer">
                        <summary class="w-full flex items-center justify-between gap-4 px-5 py-4 hover:bg-stone-50 transition-colors list-none outline-none">
                            <span class="font-medium text-stone-800 text-sm">Bao lâu thì nhận được hàng?</span>
                            <span class="shrink-0 w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 transition-transform duration-300 group-open:rotate-45">+</span>
                        </summary>
                        <div class="px-5 py-4 bg-stone-50 border-t border-stone-200">
                            <p class="text-stone-600 text-sm leading-relaxed">Thời gian giao hàng từ 2-5 ngày tùy khu vực. Nội thành thường nhanh hơn.</p>
                        </div>
                    </details>

                    <details class="group border border-stone-200 rounded-xl overflow-hidden bg-white [&::-webkit-details-marker]:hidden cursor-pointer">
                        <summary class="w-full flex items-center justify-between gap-4 px-5 py-4 hover:bg-stone-50 transition-colors list-none outline-none">
                            <span class="font-medium text-stone-800 text-sm">Có được kiểm tra hàng trước khi thanh toán không?</span>
                            <span class="shrink-0 w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 transition-transform duration-300 group-open:rotate-45">+</span>
                        </summary>
                        <div class="px-5 py-4 bg-stone-50 border-t border-stone-200">
                            <p class="text-stone-600 text-sm leading-relaxed">Có, bạn được kiểm tra sản phẩm trước khi thanh toán (COD).</p>
                        </div>
                    </details>

                    <details class="group border border-stone-200 rounded-xl overflow-hidden bg-white [&::-webkit-details-marker]:hidden cursor-pointer">
                        <summary class="w-full flex items-center justify-between gap-4 px-5 py-4 hover:bg-stone-50 transition-colors list-none outline-none">
                            <span class="font-medium text-stone-800 text-sm">Có hỗ trợ đổi trả không?</span>
                            <span class="shrink-0 w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 transition-transform duration-300 group-open:rotate-45">+</span>
                        </summary>
                        <div class="px-5 py-4 bg-stone-50 border-t border-stone-200">
                            <p class="text-stone-600 text-sm leading-relaxed">Có, bạn có thể đổi trả trong vòng 7 ngày nếu sản phẩm lỗi hoặc không đúng mô tả.</p>
                        </div>
                    </details>

                    <details class="group border border-stone-200 rounded-xl overflow-hidden bg-white [&::-webkit-details-marker]:hidden cursor-pointer">
                        <summary class="w-full flex items-center justify-between gap-4 px-5 py-4 hover:bg-stone-50 transition-colors list-none outline-none">
                            <span class="font-medium text-stone-800 text-sm">Làm sao để theo dõi đơn hàng?</span>
                            <span class="shrink-0 w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 transition-transform duration-300 group-open:rotate-45">+</span>
                        </summary>
                        <div class="px-5 py-4 bg-stone-50 border-t border-stone-200">
                            <p class="text-stone-600 text-sm leading-relaxed">Bạn có thể vào mục "Đơn hàng của tôi" để theo dõi trạng thái.</p>
                        </div>
                    </details>
                </div>
            </div>

        </div>
    </div>
  `.trim()
};