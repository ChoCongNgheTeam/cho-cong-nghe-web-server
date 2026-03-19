import { PageType, PolicyType } from "@prisma/client";
import { PageSeedData } from "../types";

export const technicalSupportPolicy: PageSeedData = {
  title: "Quy định hỗ trợ kỹ thuật",
  slug: "quy-dinh-ho-tro-ky-thuat",
  type: PageType.POLICY,
  policyType: PolicyType.TECHNICAL_SUPPORT, // Áp dụng đúng enum mới
  isPublished: true,
  priority: 10, 
//   metaTitle: "Quy định hỗ trợ kỹ thuật và sao lưu dữ liệu - ChoCongNghe",
//   metaDescription: "Các quy định quan trọng về việc sao lưu dữ liệu, bảo mật tài khoản cá nhân và hỗ trợ cài đặt phần mềm khi khách hàng mang thiết bị đến bảo hành, sửa chữa.",
  content: `
    <div class="text-primary leading-relaxed w-full">
        <h1 class="font-bold mb-5 text-primary text-center">
            Quy định hỗ trợ kỹ thuật và sao lưu dữ liệu
        </h1>

        <div class="rounded-lg px-4 py-3 bg-neutral-light-active border border-neutral mb-6">
            <p class="text-primary">
                <strong>Đối tượng áp dụng:</strong> Khách hàng có nhu cầu hỗ trợ
                phần mềm bảo hành sửa chữa sản phẩm tại ChoCongNghe.
            </p>
        </div>

        <p class="leading-relaxed mb-6 text-primary">
            Nhằm đảm bảo đầy đủ quyền lợi của khách hàng khi cài đặt, bảo hành
            sửa chữa sản phẩm, ChoCongNghe xin thông báo quy định như sau:
        </p>

        <ul class="space-y-3">
            <li class="flex gap-3 leading-relaxed text-primary">
                <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent-light text-accent mt-0.5">1</span>
                <span>Để bảo vệ dữ liệu cá nhân, Quý khách vui lòng sao lưu và <strong>XOÁ các dữ liệu cá nhân</strong> trước khi bàn giao sản phẩm cho nhân viên ChoCongNghe.</span>
            </li>
            <li class="flex gap-3 leading-relaxed text-primary">
                <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent-light text-accent mt-0.5">2</span>
                <span>ChoCongNghe không chịu trách nhiệm về việc mất dữ liệu của Quý khách trong quá trình cài đặt, bảo hành sửa chữa.</span>
            </li>
            <li class="flex gap-3 leading-relaxed text-primary">
                <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent-light text-accent mt-0.5">3</span>
                <span>Để đảm bảo quyền lợi, Quý khách vui lòng ký xác nhận để thông tin bàn giao thiết bị của Quý khách được ghi nhận trên hệ thống ChoCongNghe.</span>
            </li>
            <li class="flex gap-3 leading-relaxed text-primary">
                <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent-light text-accent mt-0.5">4</span>
                <span>ChoCongNghe không hỗ trợ cài đặt phần mềm không có bản quyền trên máy tính của Quý khách.</span>
            </li>
            <li class="flex gap-3 leading-relaxed text-primary">
                <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent-light text-accent mt-0.5">5</span>
                <span>Quý khách vui lòng kiểm tra tài khoản iCloud / Google và các tài khoản xã hội khác trên máy trước khi rời cửa hàng.</span>
            </li>
            <li class="flex gap-3 leading-relaxed text-primary">
                <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent-light text-accent mt-0.5">6</span>
                <span>Tài khoản cài đặt trên máy phải là tài khoản cá nhân của Quý khách (chủ sở hữu máy).</span>
            </li>
            <li class="flex gap-3 leading-relaxed text-primary">
                <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold bg-accent-light text-accent mt-0.5">7</span>
                <span>Nếu chưa có tài khoản iCloud, Quý khách liên hệ nhân viên kỹ thuật để được hỗ trợ tạo <strong>Tài khoản iCloud (Apple ID) / Google</strong> và các tài khoản khác <strong>miễn phí</strong> tại cửa hàng. Đồng thời yêu cầu nhân viên cung cấp thông tin, mật khẩu tài khoản vừa được tạo trước khi rời cửa hàng.</span>
            </li>
        </ul>
    </div>
  `.trim()
};