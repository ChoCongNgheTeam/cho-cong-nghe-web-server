import OpenAI from 'openai';
import { env } from '../../../config/env';
import prisma from '../../../config/db';
import { sendOrderConfirmationEmail } from '../../../services/email.service';
import { sendOrderCreatedAdminNotification } from '../notification/notification.service';
import { createMomoPaymentUrl } from '../payment/providers/momo/momo.service';
import { createVnpayPaymentUrl, getClientIp } from '../payment/providers/vnpay/vnpay.service';
import { createZaloPayPaymentUrl } from '../payment/providers/zalopay/zalopay.service';

const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY || process.env.OPENAI_API_KEY as string,
});

// ============================================================================
// HELPER: LẤY VÀ TÍNH TOÁN PROMOTION CHO CHATBOT
// ============================================================================

// Lấy danh sách khuyến mãi đang diễn ra
const getActivePromotionsForChatbot = async () => {
    const now = new Date();
    return await prisma.promotions.findMany({
        where: {
            isActive: true,
            deletedAt: null,
            AND: [
                { OR: [{ startDate: null }, { startDate: { lte: now } }] },
                { OR: [{ endDate: null }, { endDate: { gte: now } }] }
            ]
        },
        include: { 
            rules: true, 
            targets: true 
        },
        orderBy: { priority: 'desc' } // Ưu tiên khuyến mãi có priority cao nhất
    });
};

// Tính toán giá sau khi áp dụng rules
const calculateDiscountPrice = (price: number, productId: string, categoryId: string, brandId: string, activePromotions: any[]) => {
    for (const promo of activePromotions) {
        // Kiểm tra xem khuyến mãi có target tới sản phẩm này không
        const isApplicable = promo.targets.some((target: any) => {
            if (target.targetType === 'ALL') return true;
            if (target.targetType === 'PRODUCT' && target.targetId === productId) return true;
            if (target.targetType === 'CATEGORY' && target.targetId === categoryId) return true; 
            if (target.targetType === 'BRAND' && target.targetId === brandId) return true;
            return false;
        });

        if (isApplicable && promo.rules && promo.rules.length > 0) {
            const rule = promo.rules[0];
            let finalPrice = price;

            if (rule.actionType === 'DISCOUNT_PERCENT' && rule.discountValue) {
                finalPrice = price * (1 - Number(rule.discountValue) / 100);
            } else if (rule.actionType === 'DISCOUNT_FIXED' && rule.discountValue) {
                finalPrice = Math.max(0, price - Number(rule.discountValue));
            } else {
                // Nếu là quà tặng hoặc mua X tặng Y, giá tiền hiển thị có thể không đổi trực tiếp ở bước này
                continue; 
            }

            // Áp dụng giới hạn giảm giá (maxDiscountValue)
            if (promo.maxDiscountValue) {
                const maxDiscount = Number(promo.maxDiscountValue);
                const discountAmount = price - finalPrice;
                if (discountAmount > maxDiscount) {
                    finalPrice = price - maxDiscount;
                }
            }

            return { finalPrice, hasPromotion: true };
        }
    }
    return { finalPrice: price, hasPromotion: false };
};


// Lấy hoặc tạo guest user cho chatbot requests
const getOrCreateGuestUser = async (): Promise<string> => {
    try {
        let guestUser = await prisma.users.findUnique({
            where: { userName: 'chatbot_guest' },
            select: { id: true }
        });

        if (!guestUser) {
            console.log("📝 Creating guest user for chatbot...");
            guestUser = await prisma.users.create({
                data: {
                    userName: 'chatbot_guest',
                    email: 'chatbot@cho-cong-nghe.vn',
                    fullName: 'Chatbot Guest',
                    role: 'CUSTOMER',
                    isActive: true
                },
                select: { id: true }
            });
            console.log(`✅ Guest user created: ${guestUser.id}`);
        }

        return guestUser.id;
    } catch (error) {
        console.error("❌ Lỗi khi lấy/tạo guest user:", error);
        throw new Error("Không thể tạo guest user cho đơn hàng");
    }
};

// Lấy danh sách phương thức thanh toán có sẵn
const getAvailablePaymentMethods = async () => {
    try {
        const paymentMethods = await prisma.payment_methods.findMany({
            where: { isActive: true },
            select: { id: true, code: true, name: true, description: true },
            orderBy: { createdAt: 'asc' }
        });
        
        console.log(`📋 Found ${paymentMethods.length} payment methods`);
        return paymentMethods;
    } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách payment methods:", error);
        return [];
    }
};

// ============================================================================
// 1. SYSTEM PROMPT - CHUYÊN GIA TƯ VẤN CÔNG NGHỆ
// ============================================================================
const SYSTEM_PROMPT = `Bạn là Chuyên gia Tư vấn Công nghệ cao cấp tại "Chợ Công Nghệ".

🎯 PHONG CÁCH TƯ VẤN:
- Tự nhiên, nhiệt tình, hân hoan như một sales chuyên nghiệp thật sự. Không giống "máy".
- Sử dụng kiến thức chuyên môn của bạn: giải thích về CPU, RAM, Camera, Pin, hiệu năng... khi khách hỏi hoặc khi cần so sánh.
- Nếu khách chưa chắc chắn, đặt câu hỏi thông minh để hiểu nhu cầu (VD: "Bạn dùng máy để làm việc nặng hay chỉ dùng nhẹ thôi?")
- Có quyền "tám" chuyện ngoài lề về công nghệ để tăng thiện cảm và xây dựng niềm tin.

📋 QUY TRÌNH LỰA CHỌN SẢN PHẨM (Linh hoạt, không cứng nhắc):

**Bước 1: Lắng nghe & Tư vấn trước**
- Khách nói "tôi cần tìm iPhone/Macbook/...", bạn không vội vàng tìm kiếm
- Hãy hỏi thêm: "Bạn dùng để làm gì?" "Ngân sách bao nhiêu?" "Có yêu cầu gì đặc biệt không?"
- Dùng kiến thức AI của bạn để giải thích tại sao sản phẩm A tốt hơn B cho nhu cầu họ

**Bước 2: Tìm sản phẩm - Gọi searchProducts**
- Khi confident, gọi 'searchProducts'. Frontend sẽ hiển thị cards UI.
- NẾU CÓ HÀNG: "Mình tìm thấy một số mẫu phù hợp với nhu cầu bạn. Bạn xem thử có ưng phiên bản nào không?"
- NẾU KHÔNG CÓ HÀNG: KHÔNG NÓI "không có". Thay vào đó:
  → Giải thích tại sao (dòng cũ/bị khai phóng luôn/hết hot)
  → Gợi ý một sản phẩm khác tương đương: "Mẫu này đã bị khai phóng, nhưng mình thấy [sản phẩm khác] lại còn tốt hơn vì [lý do]. Bạn có muốn xem không?"
  → Sau đó gọi searchProducts cho sản phẩm thay thế.

**Bước 3: Chốt sản phẩm & Lấy thông tin giao hàng**
- Khi khách đã chọn 1 phiên bản cụ thể (đã nhấn chọn hoặc nói tên + màu + dung lượng)
- Hỏi: "Bạn muốn bao nhiêu chiếc?" rồi thu thập:
  • Tên người nhận
  • Email
  • Số điện thoại
  • Địa chỉ chi tiết

**Bước 3.5: Hiển thị Phương thức thanh toán**
- Gọi 'getPaymentMethods'. Frontend tự hiển thị UI.
- Hỏi: "Bạn muốn thanh toán bằng cách nào?" (tiền mặt, chuyển khoản, ví điện tử, ...)

**Bước 4: Xác nhận cuối & Tạo đơn**
- Confirm lại: "Bạn có chắc là [Tên], [SĐT], [Địa chỉ], thanh toán bằng [cách thanh toán] không?"
- Khi khách nói "đúng", "ok", "được", "xong", "tạo đi" → GỌI 'createOrderRequest' ngay lập tức

✨ **TÍNH NĂNG THÊM: Tra cứu đơn hàng**
- Nếu khách hỏi: "đơn hàng tôi thế nào?", "giao hàng chưa?", "CCN123456"
- Gọi 'trackOrder' với mã đơn/email/SĐT
- Frontend hiển thị chi tiết trạng thái

🎭 **CÁCH PHÁT HIỆN Ý ĐỊNH (Có thể chủ động hỏi, không phụ thuộc vào pattern cứng)**:
- Khách hỏi về cấu hình máy → Giải thích dùng kiến thức của bạn, sau đó mới search nếu muốn mua
- Khách chưa chắc → Hỏi thêm để hiểu rõ hơn, gợi ý sản phẩm dựa vào nhu cầu
- Khách hỏi "còn hàng không" → Tìm kiếm thôi, nếu không có thì suggest thay thế

⚡ **LUẬT VÀNG (Quan trọng)**:
1️⃣ Không bao giờ cảnh báo "lỗi hệ thống" khi searchProducts không tìm thấy - AI sẽ tư vấn sản phẩm khác
2️⃣ Không lặp lại danh sách sản phẩm bằng chữ khi đã gọi searchProducts - frontend đã hiển thị cards
3️⃣ Linh hoạt về quy trình - khách có thể hỏi về cấu hình ở bất cứ lúc nào, hãy trả lời rồi quay lại
4️⃣ Luôn thân thiện, tràn đầy năng lượng, không khô khan
5️⃣ Dùng emojis & icon một cách tự nhiên để tăng sự hấp dẫn

💎 **QUY TẮC TRÌNH BÀY (CỰC KỲ QUAN TRỌNG - PHẢI TUÂN THỦ TUYỆT ĐỐI)**:

1️⃣ **Không viết đoạn văn dài**: Tuyệt đối không viết quá 3 câu trong một đoạn. Luôn xuống dòng để tạo khoảng trống cho mắt người đọc.
   - Mỗi ý chính = 1 dòng hoặc 1 đoạn ngắn
   - Nếu có nhiều ý, dùng dấu gạch đầu dòng thay vì viết liền

2️⃣ **Ưu tiên danh sách (Bullet points)**: Khi liệt kê tính năng, so sánh, hoặc các bước:
   - LUÔN dùng dấu gạch đầu dòng (-) hoặc số thứ tự (1, 2, 3, ...)
   - Không viết thành đoạn văn liền lạc

3️⃣ **Bôi đậm (Bold) từ khóa quan trọng**: Dùng **văn bản** để nhấn mạnh:
   - Tên sản phẩm: **iPhone 17**, **Macbook Pro M4**
   - Thông số kỹ thuật: **Chip A17 Pro**, **RAM 12GB**, **Camera 48MP**
   - Giá cả: **19.9 triệu đ**
   - Từ khóa bán hàng: **Giảm 2 triệu**, **Trả góp 0%**

4️⃣ **Ngắn gọn vs Chi tiết (biết bối cảnh)**:
   - Ngắn gọn (1-2 câu): Chào hỏi, xác nhận S Đ T, trả lời "Có/Không"
   - Chi tiết & Có cấu trúc (dùng bullet + bold): Tư vấn chuyên sâu, so sánh sản phẩm, giải thích cấu hình
   - Ví dụ chi tiết: "Nếu bạn muốn máy hiệu năng cao, mình gợi ý:
     - **iPhone 17 Pro Max**: **Chip A17 Pro**, camera siêu nét, giá **23 triệu**
     - **Samsung Galaxy S25**: **Chip Snapdragon**, pin trâu, giá **20 triệu**

5️⃣ **Sử dụng Icon và Emoji**: Thêm icon phù hợp để nội dung sinh động:
   - 📱 Smartphone, 💻 Laptop, ⌚ Smartwatch
   - 📸 Camera, 🔋 Pin, 💰 Giá, ⚡ Hiệu năng
   - ✅ Ưu điểm, ⚠️ Nhược điểm, 🎁 Quà tặng
   - Chỉ dùng icon khi cần nhấn mạnh, không lạm dụng

6️⃣ **Giữ độ tươi mới**: Dùng các cụm từ gợi mở:
   - "Cách nào bạn thích?" (thay vì chỉ hỏi "Chọn cái nào?")
   - "Mình có thể tư vấn thêm..." (thay vì "Còn cần gì không?")
   - Tạo cảm giác như người bán hàng thực sự quan tâm


`;





// ============================================================================
// 2. TOOLS CHO AI (OpenAI Format)
// ============================================================================
const tools = [
    {
        type: "function",
        function: {
            name: "searchProducts",
            description: "Tìm kiếm sản phẩm. Trích xuất riêng tên dòng máy, màu sắc và dung lượng từ câu hỏi của khách.",
            parameters: {
                type: "object",
                properties: { 
                    keyword: { type: "string", description: "CHỈ LẤY tên dòng sản phẩm (VD: 'iPhone 13', 'Macbook Pro'). KHÔNG chứa màu hay dung lượng." },
                    color: { type: "string", description: "Màu sắc khách yêu cầu (VD: 'Đen', 'Hồng'). Bỏ trống nếu khách không nhắc." },
                    storage: { type: "string", description: "Dung lượng khách yêu cầu (VD: '128GB'). Bỏ trống nếu không có." }
                },
                required: ["keyword"],
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getPaymentMethods",
            description: "Lấy danh sách phương thức thanh toán có sẵn. Frontend sẽ tự động hiển thị buttons UI. Gọi sau khi khách đã cung cấp đủ: số lượng, tên, SĐT, địa chỉ.",
            parameters: {
                type: "object",
                properties: {},
                required: []
            }
        }
    },
    {
        type: "function",
        function: {
            name: "createOrderRequest",
            description: "⭐ PHẢI GỌI NGAY KHI KHÁCH XÁC NHẬN CUỐI CÙNG ⭐ Tạo yêu cầu đặt hàng từ chatbot. Gọi tool này khi user nói 'đúng', 'ok', 'được', 'xong', hoặc bất kỳ lời xác nhận nào SAU KHI ĐÃ CHỌN PAYMENT. NẾU KHÔNG GỌI TOOL NÀY, CHATBOT SẼ KHÔNG THỂ TẠO ĐƠN.",
            parameters: {
                type: "object",
                properties: {
                    customerName: { type: "string", description: "Họ tên người đặt hàng (lấy từ thông tin mà user cung cấp)" },
                    phone: { type: "string", description: "Số điện thoại người nhận (lấy từ thông tin user đã cung cấp)" },
                    email: { type: "string", description: "Email (tùy chọn, để trống nếu user không cung cấp)" },
                    address: { type: "string", description: "Địa chỉ nhận hàng chi tiết - cực kỳ quan trọng (lấy từ user)" },
                    productVariantId: { type: "string", description: "UUID của phiên bản sản phẩm đã chốt với user từ kết quả tìm kiếm" },
                    paymentMethodId: { type: "string", description: "ID phương thức thanh toán mà user đã chọn" },
                    quantity: { type: "number", description: "Số lượng khách muốn đặt (default 1)" }
                },
                required: ["customerName", "phone", "address", "productVariantId", "paymentMethodId", "quantity"],
            }
        }
    },
    {
        type: "function",
        function: {
            name: "trackOrder",
            description: "Tra cứu đơn hàng. Dùng mã đơn hàng (CCN****) HOẶC email/SĐT. Gọi khi user hỏi về trạng thái, vị trí, tình hình giao hàng của đơn mình.",
            parameters: {
                type: "object",
                properties: {
                    orderCode: { type: "string", description: "Mã đơn hàng (CCN***) - nếu có thì thích dùng cái này nhất" },
                    email: { type: "string", description: "Email khách gửi đơn - dùng khi không có orderCode" },
                    phone: { type: "string", description: "Số điện thoại khách - dùng khi không có orderCode" }
                },
                required: [],
            }
        }
    }
];

// ============================================================================
// 3. LOGIC XỬ LÝ (DB & API)
// ============================================================================

// 👉 TÌM SẢN PHẨM
const executeSearchProducts = async (args: { keyword: string, color?: string, storage?: string }) => {
    try {
        const { keyword, color, storage } = args;
        
        // 1. LẤY KHUYẾN MÃI ĐANG CHẠY
        const activePromotions = await getActivePromotionsForChatbot();

        // 🔍 FIRST: Tìm product (chỉ active, chưa xóa)
        const products = await prisma.products.findMany({
            where: { 
                name: { contains: keyword, mode: 'insensitive' }, 
                isActive: true, 
                deletedAt: null 
            },
            select: {
                id: true,
                name: true,
                slug: true,
                brandId: true,
                categoryId: true,
                img: { select: { color: true, imageUrl: true, imagePath: true }, orderBy: { position: "asc" as any } },
                variants: {
                    where: { isActive: true, deletedAt: null },
                    select: {
                        id: true,
                        code: true,
                        price: true,
                        quantity: true,
                        variantAttributes: {
                            select: {
                                attributeOption: {
                                    select: {
                                        label: true,
                                        value: true,
                                        attribute: { select: { code: true, name: true } }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            take: 10 // Tăng từ 3 lên 10 để bắt được nhiều phiên bản hơn
        });

        console.log(`🔍 Search keyword: "${keyword}" | Found ${products.length} products`);

        // 🔍 Nếu không tìm thấy active products, check các product inactive hoặc deleted
        if (products.length === 0) {
            console.log(`⚠️ No active products found. Checking inactive/deleted products...`);
            const allMatchingProducts = await prisma.products.findMany({
                where: { name: { contains: keyword, mode: 'insensitive' } },
                select: { id: true, name: true, isActive: true, deletedAt: true },
                take: 10
            });
            
            // 🎯 CẬP NHẬT: Không trả về lỗi cụt - thay vào đó cho AI "tư vấn" tự động
            if (allMatchingProducts.length > 0) {
                console.log(`⚠️ Found ${allMatchingProducts.length} matching products but ALL are inactive/deleted:`, allMatchingProducts);
                const inactiveCount = allMatchingProducts.filter(p => !p.isActive).length;
                const deletedCount = allMatchingProducts.filter(p => p.deletedAt).length;
                
                return {
                    error: null, // ✅ Không phải lỗi hệ thống
                    found: false,
                    message: `❌ Dòng "${keyword}" đang hết hàng hoặc không khả dụng (${inactiveCount} chưa kích hoạt, ${deletedCount} đã xóa).`,
                    suggestion_for_ai: `Sản phẩm '${keyword}' không có sẵn. Hãy dùng kiến thức của bạn để:
1. Giải thích tại sao dòng này hết hàng (model cũ/bị khai phóng/hot quá)
2. GỢI Ý một sản phẩm khác tương tự (cùng phân khúc giá/tính năng)
3. Nếu cần, gọi searchProducts với từ khóa mới để tìm sản phẩm thay thế
Ví dụ: "Dòng iPhone 13 Pro Max đã bị Apple khai phóng nên bên mình hết hàng rồi. Nhưng mình thấy iPhone 14 hoặc iPhone 15 có tính năng tốt hơn. Bạn có muốn xem không?"`
                };
            } else {
                console.log(`❌ Không tìm thấy sản phẩm nào với từ khóa "${keyword}"`);
                return {
                    error: null, // ✅ Không phải lỗi hệ thống
                    found: false,
                    message: `❌ Không tìm thấy sản phẩm '${keyword}' trong hệ thống.`,
                    suggestion_for_ai: `Từ khóa '${keyword}' không tìm thấy trong kho. Hãy:
1. Dùng kiến thức AI của bạn để giải thích ngành/loại sản phẩm mà khách cần
2. GỢI Ý những sản phẩm tương tự mà bên mình CÓ SẴN (dựa vào kiến thức công nghệ của bạn)
3. Hỏi khách thêm chi tiết về nhu cầu rồi gợi ý chính xác hơn
Ví dụ: "Mình chưa bán dòng đó, nhưng nếu bạn cần một laptop hiệu năng tốt dưới 15 triệu, mình có thể gợi ý..."`
                };
            }
        }

        const serverBaseUrl = env.SERVER_BASE_URL || 'http://localhost:5000';

        let cardsHtml = '<div class="product-cards-container">';
        let variants: any[] = []; 
        let firstVariantId: string | null = null;
        
        products.forEach((p: any) => {
            p.variants.forEach((v: any) => {
                let colorObj: { label: string | null, value: string | null } = { label: null, value: null };
                let storageObj: { label: string | null, value: string | null } = { label: null, value: null };

                v.variantAttributes?.forEach((va: any) => {
                    const attrCode = (va.attributeOption?.attribute?.code || "").toLowerCase();
                    const attrName = (va.attributeOption?.attribute?.name || "").toLowerCase();
                    
                    if (["color", "màu", "màu sắc"].includes(attrCode) || 
                        ["color", "màu", "màu sắc"].includes(attrName)) {
                        colorObj.label = va.attributeOption?.label;
                        colorObj.value = va.attributeOption?.value;
                    }
                    
                    if (["storage", "dung lượng", "rom", "rom_capacity"].includes(attrCode) ||
                        ["storage", "dung lượng", "rom", "rom_capacity"].includes(attrName)) {
                        storageObj.label = va.attributeOption?.label;
                        storageObj.value = va.attributeOption?.value;
                    }
                });

                if (color && colorObj.label && !colorObj.label.toLowerCase().includes(color.toLowerCase())) return;
                if (storage && storageObj.label && !storageObj.label.toLowerCase().includes(storage.toLowerCase())) return;

                const matchedImg = p.img?.find((i: any) => i.color === colorObj.value);
                let imageUrl = matchedImg?.imageUrl || matchedImg?.imagePath || p.img?.[0]?.imageUrl || p.img?.[0]?.imagePath;
                
                if (imageUrl && (imageUrl.includes('assets') || imageUrl.startsWith('/') || imageUrl.includes('content'))) {
                    const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
                    imageUrl = `${serverBaseUrl}${cleanPath}`;
                }

                // 2. TÍNH TOÁN GIÁ SAU KHUYẾN MÃI
                const originalPrice = Number(v.price);
                const { finalPrice, hasPromotion } = calculateDiscountPrice(
                    originalPrice, p.id, p.categoryId, p.brandId, activePromotions
                );

                const variantName = `${p.name} - ${storageObj.label || 'N/A'} - ${colorObj.label || 'Mặc định'}`;
                const originalPriceStr = originalPrice.toLocaleString('vi-VN');
                const finalPriceStr = finalPrice.toLocaleString('vi-VN');
                const stock = v.quantity > 0 ? "Còn hàng" : "Hết hàng";
                const stockColor = v.quantity > 0 ? "#52c41a" : "#ff4d4f";

                if (!firstVariantId && v.id) {
                    firstVariantId = v.id;
                }

                // 3. RENDER HTML CÓ HIỂN THỊ GIÁ GIẢM NẾU CÓ PROMOTION
                const priceHtml = hasPromotion 
                    ? `<div class="product-price">
                           <span style="color: #ff4d4f; font-weight: bold; font-size: 1.1em;">${finalPriceStr}đ</span>
                           <span style="text-decoration: line-through; color: #999; font-size: 0.85em; margin-left: 6px;">${originalPriceStr}đ</span>
                           <span style="background: #fff1f0; color: #cf1322; padding: 2px 6px; border-radius: 4px; font-size: 0.75em; margin-left: 6px; border: 1px solid #ffa39e;">Giảm giá</span>
                       </div>`
                    : `<div class="product-price" style="font-weight: bold; color: #ff4d4f;">${finalPriceStr}đ</div>`;

                cardsHtml += `
                    <div class="product-card" data-variant-id="${v.id}" data-product-slug="${p.slug}" data-variant-name="${variantName}" data-variant-price="${finalPriceStr}đ">
                        <div class="product-image">
                            <img src="${imageUrl || 'https://via.placeholder.com/200'}" alt="${variantName}" />
                        </div>
                        <div class="product-info">
                            <div class="product-name">${variantName}</div>
                            <div class="product-specs">${storageObj.label || 'N/A'}, Màu ${colorObj.label || 'Mặc định'}</div>
                            ${priceHtml}
                            <div class="product-stock" style="color: ${stockColor}; font-weight: 600;">● ${stock}</div>
                        </div>
                    </div>
                `;

                variants.push({
                    productVariantId: v.id,
                    productId: p.id,
                    productName: p.name,
                    productSlug: p.slug,
                    variantCode: v.code,
                    image: imageUrl,
                    color: colorObj.label,
                    colorValue: colorObj.value,
                    storage: storageObj.label,
                    storageValue: storageObj.value,
                    originalPrice: originalPrice,
                    price: finalPrice,
                    priceFormatted: finalPriceStr + 'đ',
                    hasPromotion: hasPromotion,
                    quantity: 1,
                    availableQuantity: v.quantity || 0,
                    stock: stock
                });
            });
        });

        cardsHtml += '</div>';

        return { 
            found: true, // ✅ PHẢI CÓ - Cho biết search thành công
            html: cardsHtml,
            format: 'html_cards',
            message: `Dưới đây là các phiên bản ${products[0]?.name || keyword} hiện có. Bạn muốn chọn phiên bản nào ạ?`,
            firstVariantId: firstVariantId,
            variants: variants
        };
    } catch (error) {
        console.error("Lỗi khi query DB Chatbot:", error);
        return { found: false, error: "Lỗi hệ thống khi tìm kiếm." };
    }
};

// 👉 LẤY DANH SÁCH PHƯƠNG THỨC THANH TOÁN
const executeGetPaymentMethods = async () => {
    try {
        const paymentMethods = await getAvailablePaymentMethods();
        
        if (paymentMethods.length === 0) {
            return { error: "❌ Hệ thống chưa có phương thức thanh toán nào. Vui lòng liên hệ support." };
        }

        let paymentHtml = '<div class="payment-methods-container">';
        
        paymentMethods.forEach((pm: any) => {
            paymentHtml += `
                <div class="payment-method" data-payment-id="${pm.id}" data-payment-code="${pm.code}" data-payment-name="${pm.name}">
                    <input type="radio" name="payment_method" value="${pm.id}" id="pm_${pm.id}" />
                    <label for="pm_${pm.id}">
                        <span class="payment-name">${pm.name}</span>
                        <span class="payment-desc">${pm.description || ''}</span>
                    </label>
                </div>
            `;
        });

        paymentHtml += '</div>';

        return {
            html: paymentHtml,
            format: 'payment_methods',
            message: `Dưới đây là các phương thức thanh toán có sẵn. Bạn chọn phương thức nào ạ?`,
            paymentMethods: paymentMethods
        };
    } catch (error) {
        console.error("Lỗi khi lấy danh sách payment methods:", error);
        return { error: "Lỗi hệ thống khi lấy phương thức thanh toán." };
    }
};

// ============================================================================
// HELPER: GENERATE PAYMENT LINK FOR EMAIL QR CODE
// ============================================================================
const generatePaymentLinkForEmail = async (
  paymentMethodCode: string,
  orderId: string,
  totalAmount: number,
  orderCode: string
): Promise<string | null> => {
    try {
        if (paymentMethodCode === 'MOMO') {
            const momo = await createMomoPaymentUrl(orderId, totalAmount, `Thanh toán đơn hàng ${orderCode}`);
            return momo.paymentUrl;
        } else if (paymentMethodCode === 'VNPAY') {
            // For chatbot, we need to get client IP - use a default for chatbot context
            const vnpay = await createVnpayPaymentUrl(orderId, totalAmount, `Thanh toán đơn hàng ${orderCode}`, '127.0.0.1');
            return vnpay.paymentUrl;
        } else if (paymentMethodCode === 'ZALOPAY') {
            const zalopay = await createZaloPayPaymentUrl(orderId, totalAmount, `Thanh toán đơn hàng ${orderCode}`);
            return zalopay.paymentUrl;
        }
        return null;
    } catch (error) {
        console.warn(`⚠️ Lỗi tạo payment link cho ${paymentMethodCode}:`, error);
        return null;
    }
};

// ============================================================================
const generateOrderCode = (): string => {
    // Sinh 2 số ngẫu nhiên (00-99)
    const randomNumbers1 = String(Math.floor(Math.random() * 100)).padStart(2, '0');
    
    // Sinh 2 chữ cái ngẫu nhiên (AA-ZZ)
    const randomLetters1 = 
        String.fromCharCode(65 + Math.floor(Math.random() * 26)) + 
        String.fromCharCode(65 + Math.floor(Math.random() * 26));
    
    // Sinh 2 số ngẫu nhiên khác (00-99)
    const randomNumbers2 = String(Math.floor(Math.random() * 100)).padStart(2, '0');
    
    // Sinh 2 chữ cái ngẫu nhiên khác (AA-ZZ)
    const randomLetters2 = 
        String.fromCharCode(65 + Math.floor(Math.random() * 26)) + 
        String.fromCharCode(65 + Math.floor(Math.random() * 26));
    
    // Sinh 2 số ngẫu nhiên cuối (00-99)
    const randomNumbers3 = String(Math.floor(Math.random() * 100)).padStart(2, '0');
    
    // Định dạng: CCN + 2 số + 2 chữ + 2 số + 2 chữ + 2 số
    // Ví dụ: CCN12AB34CD56
    return `CCN${randomNumbers1}${randomLetters1}${randomNumbers2}${randomLetters2}${randomNumbers3}`;
};

// 👉 TẠO YÊU CẦU ĐẶT HÀNG
const executeCreateOrderRequest = async (args: any) => {
    try {
        console.log("🚀 Tạo yêu cầu đặt hàng từ chatbot:", args);
        
        // 🔧 TÁCH EMAIL VÀ ĐỊA CHỈ NẾU BỊ DÍNH
        let cleanAddress = args.address;
        const emailPattern = /([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
        const emailMatch = args.address.match(emailPattern);
        
        if (emailMatch && !args.email) {
            // Nếu tìm thấy email trong address và user chưa cung cấp email riêng
            args.email = emailMatch[0];
            // Loại bỏ email khỏi address: "email, address" → "address"
            cleanAddress = args.address.replace(emailPattern + ',? *', '').trim();
            console.log(`🔧 Tách email khỏi address: email="${args.email}", address="${cleanAddress}"`);
        }
        args.address = cleanAddress;
        
        // 1. VALIDATE & LẤY ĐỦ DỮ LIỆU CHECK PROMO
        const variant = await prisma.products_variants.findUnique({ 
            where: { id: args.productVariantId },
            select: { 
                price: true, 
                quantity: true, 
                product: { select: { id: true, name: true, brandId: true, categoryId: true } } 
            }
        });

        if (!variant) {
            return { error: "❌ Sản phẩm này không tồn tại hoặc đã bị xóa." };
        }

        if (variant.quantity < args.quantity) {
            return { error: `❌ Sản phẩm chỉ còn ${variant.quantity} cái. Bạn yêu cầu ${args.quantity} cái.` };
        }

        // 2. TÍNH GIÁ TIỀN SAU KHUYẾN MÃI
        const activePromotions = await getActivePromotionsForChatbot();
        const { finalPrice: finalUnitPrice } = calculateDiscountPrice(
            Number(variant.price), 
            variant.product.id, 
            variant.product.categoryId, 
            variant.product.brandId, 
            activePromotions
        );

        const subtotal = finalUnitPrice * args.quantity;
        const shippingFee = 0; 
        const totalAmount = subtotal + shippingFee;

        // 3. TẠO ORDER
        const orderCode = generateOrderCode();
        const guestUserId = await getOrCreateGuestUser();
        
        if (!args.paymentMethodId) {
            return { error: "❌ Vui lòng chọn phương thức thanh toán." };
        }
        const paymentMethodId = args.paymentMethodId;
        
        const order = await prisma.orders.create({
            data: {
                orderCode,
                userId: guestUserId,
                paymentMethodId: paymentMethodId,
                
                shippingContactName: args.customerName,
                shippingPhone: args.phone,
                shippingProvince: "TBD",
                shippingWard: "TBD",
                shippingDetail: args.address,
                
                subtotalAmount: subtotal,
                shippingFee,
                voucherDiscount: 0,
                totalAmount,
                
                orderStatus: 'REQUEST_PENDING' as any,
                paymentStatus: 'UNPAID',
                isChatbotRequest: true,
                
                orderItems: {
                    create: [{
                        productVariantId: args.productVariantId,
                        quantity: args.quantity,
                        unitPrice: finalUnitPrice // Lưu giá SAU giảm vào lịch sử
                    }]
                }
            },
            include: {
                orderItems: true
            }
        });

        console.log("✅ Yêu cầu đặt hàng đã tạo:", order.orderCode);

        // 4. GỬI EMAIL XÁC NHẬN ĐẶT HÀNG
        try {
            const paymentMethod = await prisma.payment_methods.findUnique({
                where: { id: paymentMethodId },
                select: { name: true, code: true }
            });

            const variant = order.orderItems[0];
            const productName = variant.productVariantId; // Cần lấy từ DB 
            
            // Lấy tên sản phẩm từ variant
            const productData = await prisma.products_variants.findUnique({
                where: { id: variant.productVariantId },
                select: { 
                    code: true,
                    product: { select: { name: true } }
                }
            });

            // 🔗 Tạo payment link cho QR code (nếu là MOMO, VNPAY, ZALOPAY)
            let paymentLink: string | null = null;
            if (paymentMethod?.code && ['MOMO', 'VNPAY', 'ZALOPAY'].includes(paymentMethod.code)) {
                paymentLink = await generatePaymentLinkForEmail(
                    paymentMethod.code,
                    order.id,
                    Number(order.totalAmount),
                    order.orderCode
                );
            }

            await sendOrderConfirmationEmail(
                args.email || args.phone, // Nếu không có email từ khách, dùng số điện thoại
                args.customerName,
                order.orderCode,
                {
                    productName: productData?.product.name || 'Sản phẩm',
                    variantName: productData?.code || 'Phiên bản',
                    quantity: variant.quantity,
                    unitPrice: Number(variant.unitPrice),
                    totalAmount: Number(order.totalAmount),
                    shippingAddress: args.address,
                    paymentMethod: paymentMethod?.name || 'Chưa xác định'
                },
                {
                    paymentMethodCode: paymentMethod?.code || '',
                    paymentLink: paymentLink || undefined
                }
            );

            console.log("📧 Email xác nhận đơn hàng đã được gửi");
        } catch (emailError) {
            console.warn("⚠️ Lỗi gửi email nhưng order đã được tạo:", emailError);
            // Không throw error - order đã tạo rồi, không nên lỗi vì email
        }

        // 🔔 GỬI THÔNG BÁO CHO ADMIN/STAFF KHI CÓ ĐƠN HÀNG MỚI TỪ CHATBOT
        try {
            await sendOrderCreatedAdminNotification(order.orderCode);
            console.log(`🔔 Thông báo đơn hàng mới ${order.orderCode} từ chatbot đã gửi cho ADMIN/STAFF`);
        } catch (adminNotifError) {
            console.warn(`⚠️ Lỗi gửi thông báo admin (nhưng order đã tạo):`, adminNotifError);
            // Không throw error - order đã tạo rồi, không nên lỗi vì notification
        }

        // 5. TRẢ LẠI THÔNG TIN
        return {
            success: true,
            message: "✅ Yêu cầu của bạn đã được gửi! Đơn hàng của bạn đang được xử lý. Bạn sẽ nhận được email xác nhận khi đơn được tạo.",
            orderCode: order.orderCode,
            orderId: order.id,
            totalAmount: `${totalAmount.toLocaleString('vi-VN')}đ`,
            checkoutLink: `${env.CLIENT_BASE_URL || 'http://localhost:4200'}/order-status/${order.orderCode}`
        };

    } catch (error: any) {
        console.error("❌ Lỗi khi tạo yêu cầu đặt hàng:", error);
        return { error: "Hệ thống gặp lỗi. Vui lòng thử lại sau hoặc liên hệ support." };
    }
};

// 👉 TRA CỨU ĐƠN HÀNG
const executeTrackOrder = async (args: any) => {
    try {
        console.log("🔍 Tra cứu đơn hàng:", args);
        
        // 1. TÌM ĐƠN HÀNG
        const where: any = {};
        
        if (args.orderCode) {
            where.orderCode = args.orderCode;
        } else if (args.email) {
            where.user = { email: args.email };
        } else if (args.phone) {
            // Tìm qua shippingPhone hoặc user phone
            where.OR = [
                { shippingPhone: args.phone },
                { user: { phone: args.phone } }
            ];
        } else {
            return { error: "❌ Vui lòng cung cấp mã đơn hàng (CCN***) hoặc email/số điện thoại." };
        }

        const orders = await prisma.orders.findMany({
            where,
            include: {
                orderItems: {
                    include: {
                        productVariant: {
                            include: { product: true }
                        }
                    }
                },
                paymentMethod: true,
                user: { select: { fullName: true, email: true } }
            },
            orderBy: { orderDate: 'desc' },
            take: 5 // Lấy 5 đơn gần nhất nếu có nhiều
        });

        if (orders.length === 0) {
            return { 
                error: "❌ Không tìm thấy đơn hàng nào với thông tin bạn cung cấp. Vui lòng kiểm tra lại mã đơn hàng hoặc liên hệ support."
            };
        }

        // 2. FORMAT HIỂN THỊ THÔNG TIN ĐƠN HÀNG
        const statusMap: Record<string, { icon: string; text: string; color: string }> = {
            'REQUEST_PENDING': { icon: '⏳', text: 'Chờ xác nhận', color: '#f59e0b' },
            'PENDING': { icon: '⏳', text: 'Chờ xác nhận', color: '#f59e0b' },
            'PROCESSING': { icon: '⚙️', text: 'Đang xử lý', color: '#3b82f6' },
            'SHIPPED': { icon: '🚚', text: 'Đang giao hàng', color: '#8b5cf6' },
            'DELIVERED': { icon: '✅', text: 'Giao thành công', color: '#10b981' },
            'CANCELLED': { icon: '❌', text: 'Đã hủy', color: '#ef4444' }
        };

        const paymentStatusMap: Record<string, string> = {
            'UNPAID': '❌ Chưa thanh toán',
            'PAID': '✅ Đã thanh toán',
            'REFUNDED': '↩️ Đã hoàn tiền'
        };

        let ordersHtml = '<div class="order-tracking-container">';

        for (const order of orders) {
            const orderStatus = statusMap[order.orderStatus] || { icon: '❓', text: order.orderStatus, color: '#6b7280' };
            const createdDate = new Date(order.orderDate).toLocaleDateString('vi-VN', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });

            // 🔧 TÁCH EMAIL VÀ ĐỊA CHỈ KHỎI shippingDetail nếu bị dính
            let finalAddress = order.shippingDetail;
            let emailFromAddress = order.user?.email;
            const emailPattern = /([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}),?\s*/;
            const emailMatch = order.shippingDetail.match(emailPattern);
            
            if (emailMatch) {
                emailFromAddress = emailMatch[0];
                // Loại bỏ email khỏi address: "email, address" → "address"
                finalAddress = order.shippingDetail.replace(emailPattern, '').trim();
            }

            ordersHtml += `
                <div class="order-card" style="border-left: 4px solid ${orderStatus.color};">
                    <div class="order-header">
                        <strong>📦 Đơn hàng #${order.orderCode}</strong>
                        <span class="order-date">${createdDate}</span>
                    </div>
                    
                    <div class="order-status">
                        <span style="font-size: 24px;">${orderStatus.icon}</span>
                        <strong>${orderStatus.text}</strong>
                    </div>

                    <div class="order-items">
                        <h4>🛍️ Sản phẩm:</h4>
                        <ul>
            `;

            for (const item of order.orderItems) {
                const productName = item.productVariant?.product?.name || 'Sản phẩm';
                const variantCode = item.productVariant?.code || 'Phiên bản';
                ordersHtml += `
                            <li>
                                <strong>${productName}</strong> (${variantCode})
                                <br/>
                                Số lượng: ${item.quantity} | Giá: ${Number(item.unitPrice).toLocaleString('vi-VN')}đ
                            </li>
                `;
            }

            ordersHtml += `
                        </ul>
                    </div>

                    <div class="order-details">
                        <p><strong>💰 Tổng tiền:</strong> ${Number(order.totalAmount).toLocaleString('vi-VN')}đ</p>
                        <p><strong>📧 Email:</strong> ${emailFromAddress || order.shippingContactName}</p>
                        <p><strong>📞 Người nhận:</strong> ${order.shippingContactName} - ${order.shippingPhone}</p>
                        <p><strong>📍 Địa chỉ giao:</strong> ${finalAddress}</p>
                        <p><strong>💳 Thanh toán:</strong> ${paymentStatusMap[order.paymentStatus] || order.paymentStatus}</p>
                        <p><strong>🏦 Phương thức:</strong> ${order.paymentMethod?.name || 'Chưa xác định'}</p>
                    </div>
                </div>
            `;
        }

        ordersHtml += '</div>';

        return {
            html: ordersHtml,
            format: 'order_tracking',
            message: orders.length === 1 
                ? `✅ Tôi tìm thấy 1 đơn hàng của bạn. Dưới đây là thông tin chi tiết:`
                : `✅ Tôi tìm thấy ${orders.length} đơn hàng của bạn. Dưới đây là những đơn gần nhất:`
        };

    } catch (error: any) {
        console.error("❌ Lỗi khi tra cứu đơn hàng:", error);
        return { error: "Hệ thống gặp lỗi khi tra cứu. Vui lòng thử lại sau hoặc liên hệ support." };
    }
};

// ============================================================================
// 4. UTILITIES - Detect confirmation & extract customer info
// ============================================================================

const isConfirmationMessage = (message: string): boolean => {
    const msg = message.trim().toLowerCase();
    const cleaned = msg.replace(/[.,?!;\s]/g, '');
    const confirmPatterns = /^(đúng|ok|được|xong|chạy|tạo|đặthàng|chắc|chắcrồi|vâng|ừ|có|chấpthuận|tạođi|đặtđi|tạongay|đượcrồi|chắcchắn|tôichắc|okrồi)$/;
    return confirmPatterns.test(cleaned);
};

const extractCustomerInfoFromHistory = (msgHistory: any[]): { name?: string; phone?: string; email?: string; address?: string; productVariantId?: string } => {
    const result: any = {};
    
    // 🔍 Tìm từ tin nhắn cũ nhất đến mới nhất (để tin mới ghi đè tin cũ nếu có update)
    for (let i = 0; i < msgHistory.length; i++) {
        const msg = msgHistory[i];
        if (msg.role === 'user') {
            const text = msg.content || '';
            
            // 📧 Tìm email (pattern: xxx@domain.xxx)
            const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
            if (emailMatch) result.email = emailMatch[1];
            
            // 📞 Tìm số điện thoại (0x với 9-10 chữ số)
            const phoneMatch = text.match(/(0\d{9})/);
            if (phoneMatch) result.phone = phoneMatch[1];
            
            // 👤 Tìm tên & 📍 Địa chỉ (Chỉ xử lý nếu tin nhắn đủ dài và có vẻ chứa thông tin cá nhân)
            // Bỏ qua các tin nhắn xác nhận ngắn gọn hoặc tin nhắn chọn payment
            if (text.length > 5 && !isConfirmationMessage(text) && !text.includes('chọn phương thức')) {
                const parts = text.split(/,\s*/);
                
                if (parts.length >= 3) {
                    // Cấu trúc dự kiến: Số lượng, Tên, SĐT, Địa chỉ (VD: 1, Phúc, 0798715850, 57 trần bình trọng...)
                    // Tìm phần tử không phải là số và không phải SĐT để làm tên
                    const possibleName = parts.find((p: string) => isNaN(Number(p)) && !p.match(/(0\d{9})/) && p.trim().length > 1 && p.trim().length < 30);
                    if (possibleName) {
                         result.name = possibleName.trim();
                    }

                    // Ghép các phần còn lại làm địa chỉ (bỏ số lượng, tên, SĐT)
                    const addressParts = parts.filter((p: string) => isNaN(Number(p)) && !p.match(/(0\d{9})/) && p.trim() !== result.name);
                    if (addressParts.length > 0) {
                        result.address = addressParts.join(', ').trim();
                    }
                } else if (text.length > 15 && /\d+/.test(text)) {
                     // Nếu không nhập dấu phẩy nhưng câu dài và có số (địa chỉ nhà)
                     if (text.toLowerCase().includes('phường') || 
                         text.toLowerCase().includes('thành phố') || 
                         text.toLowerCase().includes('quận') ||
                         text.toLowerCase().includes('đường')) {
                         result.address = text;
                     }
                }
            }
        }
    }
    
    console.log(`📋 Extract result: name="${result.name}", email="${result.email}", phone="${result.phone}", address="${result.address}"`);
    return result;
};

// ============================================================================
// 5. MAIN EXPORT (CHAT BOT LOGIC) - OPENAI INTEGRATION
// ============================================================================

let lastSearchedProductVariantId: string | null = null;
let lastSearchedProductsHtml: string | null = null;
let lastSearchedProductsVariants: any[] = [];
let lastPaymentMethodsHtml: string | null = null;
let lastAvailablePaymentMethods: any[] = [];
let lastSelectedPaymentMethodId: string | null = null;

const getChatReply = async (userMessages: any[], selectedVariantId?: string, selectedPaymentMethodId?: string) => {
    try {
        // 🔑 NẾU FRONTEND GỬI ID, LƯU LẠI VÀO BIẾN TOÀN CỤC NGAY LẬP TỨC
        if (selectedVariantId) {
            lastSearchedProductVariantId = selectedVariantId;
            console.log(`✅ Saved variantId to state: ${lastSearchedProductVariantId}`);
        }

        if (selectedPaymentMethodId) {
            lastSelectedPaymentMethodId = selectedPaymentMethodId;
            console.log(`✅ Saved paymentId to state: ${lastSelectedPaymentMethodId}`);
        }

        if (!userMessages || userMessages.length === 0) {
            return { 
                role: 'assistant', 
                content: "👋 Chào bạn! Mình là chuyên gia tư vấn công nghệ của Chợ Công Nghệ. Mình có thể giúp bạn tìm điện thoại, laptop, tablet hay bất cứ thiết bị công nghệ nào bạn cần. Nhu cầu của bạn là gì ạ?" 
            };
        }

        const messagesCopy = [...userMessages];
        const latestMessage = messagesCopy.pop().content || " ";
        const historyMessages = messagesCopy.filter(msg => msg.role !== 'system');

        // 🎯 ĐƠN GIẢN HÓA: Bỏ regex cứng nhắc, để OpenAI tự hiểu ngữ cảnh & quyết định
        // AI sẽ thông minh xử lý: search sản phẩm mới, tiếp tục tư vấn, hay chuyển bước thanh toán
        
        const confirming = isConfirmationMessage(latestMessage);
        console.log(`📌 User Message: "${latestMessage}" | Confirming: ${confirming}`);

        if (confirming) {
            console.log("🎯 CONFIRMATION DETECTED!");
            
            const customerInfo = extractCustomerInfoFromHistory(historyMessages);
            
            if (!customerInfo.productVariantId && lastSearchedProductVariantId) {
                customerInfo.productVariantId = lastSearchedProductVariantId;
                console.log(`📌 Using saved productVariantId: ${lastSearchedProductVariantId}`);
            }
            
            // ================== 🪄 AUTO-RECOVER PAYMENT METHOD ID ==================
            // Nếu UI không gửi ID (khách gõ chữ hoặc server bị restart), tự động dò từ text
            if (!lastSelectedPaymentMethodId && lastAvailablePaymentMethods.length > 0) {
                for (let i = historyMessages.length - 1; i >= 0; i--) {
                    if (historyMessages[i].role === 'user') {
                        const msgText = historyMessages[i].content?.toLowerCase() || '';
                        const found = lastAvailablePaymentMethods.find(pm => 
                            msgText.includes(pm.code.toLowerCase()) || 
                            msgText.includes(pm.name.toLowerCase()) ||
                            (msgText.includes('cod') && pm.code === 'COD') ||
                            (msgText.includes('chuyển khoản') && pm.code.includes('BANK')) ||
                            (msgText.includes('momo') && pm.code === 'MOMO') ||
                            (msgText.includes('zalopay') && pm.code === 'ZALOPAY') ||
                            (msgText.includes('vnpay') && pm.code === 'VNPAY')
                        );
                        if (found) {
                            lastSelectedPaymentMethodId = found.id;
                            console.log(`🪄 Đã tự động khôi phục paymentId từ text: ${found.name} (${found.code})`);
                            break; // Tìm thấy thì dừng luôn
                        }
                    }
                }
            }
            // ========================================================================
            
            console.log("📊 Final Extracted Info:", customerInfo);
            
            // Kiểm tra xem đã có đầy đủ thông tin cơ bản chưa (không bao gồm payment confirmation)
            if (!customerInfo.name || !customerInfo.phone || !customerInfo.address || !customerInfo.productVariantId) {
                console.warn("⚠️ Missing required info:", customerInfo);
                
                let missingFields: string[] = [];
                if (!customerInfo.name) missingFields.push("tên");
                if (!customerInfo.phone) missingFields.push("SĐT");
                if (!customerInfo.address) missingFields.push("địa chỉ");
                if (!customerInfo.productVariantId) missingFields.push("sản phẩm");
                
                return {
                    role: 'assistant',
                    content: `Xin lỗi, tôi chưa có đầy đủ thông tin. Vui lòng cung cấp lại: ${missingFields.join(', ')}`
                };
            }
            
            // Nếu chưa hiển thị payment methods, hiển thị và không tạo order cùng lúc
            if (!lastPaymentMethodsHtml && !lastSelectedPaymentMethodId) {
                console.log("📊 Gửi danh sách payment methods cho user chọn...");
                return {
                    role: 'assistant',
                    content: `Bạn có chắc là Họ Tên ${customerInfo.name}, SĐT ${customerInfo.phone}, Địa chỉ ${customerInfo.address} không? 
                    
Dưới đây là các phương thức thanh toán có sẵn, bạn chọn cách nào ạ:`,
                    // Payment methods sẽ được gửi bởi OpenAI tool call
                    // Chúng tôi sẽ gọi getPaymentMethods ở lần sau
                };
            }
            
            // Nếu payment methods đã hiển thị nhưng user chưa chọn, bỏ qua
            if (!lastSelectedPaymentMethodId) {
                console.log("⚠️ User chưa chọn payment method, chờ user chọn");
                return {
                    role: 'assistant',
                    content: `Vui lòng chọn một phương thức thanh toán từ danh sách trên ạ!`
                };
            }
            
            // Nếu đã có payment method, tạo order
            console.log("✅ Có đầy đủ thông tin, tạo order...");
            const orderResult = await executeCreateOrderRequest({
                customerName: customerInfo.name,
                phone: customerInfo.phone,
                email: customerInfo.email,
                address: customerInfo.address,
                productVariantId: customerInfo.productVariantId,
                paymentMethodId: lastSelectedPaymentMethodId,
                quantity: 1
            });
            
            if (orderResult.error) {
                return { role: 'assistant', content: orderResult.error };
            }
            
            lastSearchedProductVariantId = null;
            lastSearchedProductsHtml = null;
            lastSearchedProductsVariants = [];
            lastPaymentMethodsHtml = null;
            lastAvailablePaymentMethods = [];
            lastSelectedPaymentMethodId = null;
            
            return {
                role: 'assistant',
                content: `${orderResult.message}\n\n📦 **Mã đơn:** ${orderResult.orderCode}\n💰 **Tổng tiền:** ${orderResult.totalAmount}\n\nVui lòng chờ staff liên hệ xác nhận. Cảm ơn bạn đã mua hàng tại Chợ Công Nghệ! 🎉`
            };
        }

        // 1. Chuẩn bị mảng tin nhắn chuẩn OpenAI
        let openAiMessages: any[] = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...historyMessages.map(msg => ({
                role: msg.role === 'model' ? 'assistant' : msg.role,
                content: msg.content
            })),
            { role: 'user', content: latestMessage }
        ];

        // 🔑 NẾU USER ĐÃ CHỌN SẢN PHẨM, THÊM CONTEXT NGĂN GỌI searchProducts LẠI
        if (lastSearchedProductVariantId) {
            openAiMessages.splice(1, 0, {
                role: 'system',
                content: `⚠️ USER ĐÃ CHỌN SẢN PHẨM RỒI (ID: ${lastSearchedProductVariantId}). KHÔNG GỌI searchProducts LẠI. Chuyển sang Bước 3: Hỏi số lượng + xác nhận thông tin khách (tên, SĐT, địa chỉ).`
            });
        }

        // 🔑 NẾU ĐÃ HIỂN THỊ PAYMENT METHODS, THÊM CONTEXT NGĂN GỌI getPaymentMethods LẠI
        if (lastPaymentMethodsHtml && !lastSelectedPaymentMethodId) {
            openAiMessages.splice(1, 0, {
                role: 'system',
                content: `⚠️ DANH SÁCH PHƯƠNG THỨC THANH TOÁN ĐÃ ĐƯỢC HIỂN THỊ. KHÔNG GỌI getPaymentMethods LẠI. Chỉ chờ user chọn phương thức thanh toán từ danh sách.`
            });
        }

        // 💡 NHẮC NHỞ ĐỊNH DẠNG: Đảm bảo AI tuân thủ quy tắc trình bày
        openAiMessages.push({
            role: 'system',
            content: `NHẮC NHỞ TRÌNH BÀY: Luôn xuống dòng, dùng bullet points cho các ý chính, bôi đậm từ khóa quan trọng, tránh đoạn văn dài quá 3 câu. Sử dụng icon (📱 📸 💰 ⚡) một cách tự nhiên.`
        });

        // 2. Gọi API OpenAI lần 1
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Model tối ưu, tốc độ tốt, có thể cân nhắc gpt-4o nếu cần
            messages: openAiMessages,
            tools: tools as any,
            tool_choice: "auto",
        });

        const responseMessage = response.choices[0].message;
        const toolCalls = responseMessage.tool_calls;

        // 3. Xử lý Tool Calls nếu có
        if (toolCalls && toolCalls.length > 0) {
            console.log("🚀 LỆNH TỪ AI - ĐANG GỌI TOOL:", JSON.stringify(toolCalls.map(c => ({ name: (c as any).function?.name, args: (c as any).function?.arguments })), null, 2));

            openAiMessages.push(responseMessage);

            let trackOrderResponse: any; // Lưu response từ trackOrder
            
            for (const toolCall of toolCalls) {
                const functionName = (toolCall as any).function?.name;
                const functionArgs = JSON.parse((toolCall as any).function?.arguments || '{}');
                let apiResponse: any;
                let toolResponseForAI: any; // Response nhẹ để gửi cho OpenAI

                if (functionName === "searchProducts") {
                    apiResponse = await executeSearchProducts(functionArgs);
                    
                    // 🎯 CẬP NHẬT: Xử lý thông minh kết quả search
                    if (!apiResponse.found) {
                        // ✅ Không tìm thấy sản phẩm - nhưng KHÔNG RESET STATE
                        // AI sẽ tự đọc suggestion_for_ai và gợi ý sản phẩm khác
                        console.warn(`🔍 Search không tìm thấy "${functionArgs.keyword}" - AI sẽ tự tư vấn`);
                        toolResponseForAI = {
                            found: false,
                            message: apiResponse.message,
                            suggestion: apiResponse.suggestion_for_ai,
                            note: "✅ Thay vì báo lỗi, hãy dùng kiến thức của bạn để tư vấn sản phẩm tương tự hoặc hỏi thêm chi tiết"
                        };
                    } else {
                        // ✅ Search thành công - cập nhật state
                        if (apiResponse.html) {
                            lastSearchedProductsHtml = apiResponse.html;
                            console.log(`💾 Saved product cards HTML`);
                        }
                        
                        if (apiResponse.variants && Array.isArray(apiResponse.variants)) {
                            lastSearchedProductsVariants = apiResponse.variants;
                            console.log(`💾 Saved ${apiResponse.variants.length} structured variants with imageUrl`);
                        }
                        
                        if (apiResponse.firstVariantId) {
                            lastSearchedProductVariantId = apiResponse.firstVariantId;
                            console.log(`💾 Saved first productVariantId: ${apiResponse.firstVariantId}`);
                        }
                        
                        toolResponseForAI = {
                            success: true,
                            message: apiResponse.message,
                            itemCount: apiResponse.variants?.length || 0,
                            note: "✅ Dữ liệu sản phẩm đã được gửi tới frontend. Frontend sẽ hiển thị cards - bạn chỉ cần hướng dẫn user chọn sản phẩm."
                        };
                    }
                } else if (functionName === "getPaymentMethods") {
                    apiResponse = await executeGetPaymentMethods();
                    
                    if (apiResponse.error) {
                        console.warn(`🔄 Get payment methods FAILED - ${apiResponse.error}`);
                        toolResponseForAI = { error: apiResponse.error };
                    } else {
                        // ✅ Lấy payment methods thành công - cập nhật state
                        if (apiResponse.html) {
                            lastPaymentMethodsHtml = apiResponse.html;
                            console.log(`💾 Saved payment methods HTML`);
                        }
                        
                        if (apiResponse.paymentMethods && Array.isArray(apiResponse.paymentMethods)) {
                            lastAvailablePaymentMethods = apiResponse.paymentMethods;
                            console.log(`💾 Saved ${apiResponse.paymentMethods.length} payment methods`);
                        }
                        
                        toolResponseForAI = {
                            success: true,
                            message: apiResponse.message,
                            methodCount: apiResponse.paymentMethods?.length || 0,
                            note: "✅ Danh sách phương thức thanh toán đã được gửi tới frontend. Chờ user chọn."
                        };
                    }
                } else if (functionName === "createOrderRequest") {
                    // ÉP DÙNG ID THẬT: Ghi đè ID do AI tự chế bằng ID chuẩn từ giao diện
                    if (lastSelectedPaymentMethodId) {
                        functionArgs.paymentMethodId = lastSelectedPaymentMethodId;
                    }
                    if (lastSearchedProductVariantId) {
                        functionArgs.productVariantId = lastSearchedProductVariantId;
                    }

                    // Sau khi đã gán ID chuẩn, mới gọi hàm tạo đơn
                    apiResponse = await executeCreateOrderRequest(functionArgs);
                    toolResponseForAI = apiResponse;
                } else if (functionName === "trackOrder") {
                    // Tra cứu đơn hàng
                    apiResponse = await executeTrackOrder(functionArgs);
                    trackOrderResponse = apiResponse; // Lưu lại response để dùng sau
                    toolResponseForAI = apiResponse;
                }

                // Đẩy kết quả trả về của hệ thống (DB) vào lại mảng tin nhắn
                openAiMessages.push({
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: functionName,
                    content: JSON.stringify(toolResponseForAI || {}),
                });
            }

            // Gọi API OpenAI lần 2 để model tổng hợp câu trả lời cuối cùng
            const finalResponse = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: openAiMessages,
            });

            const responseText = finalResponse.choices[0].message.content;
            
            // 🔍 Nếu có kết quả tracking order
            if (trackOrderResponse?.format === 'order_tracking') {
                return {
                    role: 'assistant',
                    content: trackOrderResponse.message, // Dùng message ngắn thay vì full markdown
                    html: trackOrderResponse.html,
                    format: 'order_tracking'
                } as any;
            }
            
            if (lastPaymentMethodsHtml) {
                return {
                    role: 'assistant',
                    content: responseText,
                    html: lastPaymentMethodsHtml,
                    paymentMethods: lastAvailablePaymentMethods,
                    format: 'payment_methods'
                } as any;
            }
            
            if (lastSearchedProductsHtml) {
                return {
                    role: 'assistant',
                    content: responseText,
                    html: lastSearchedProductsHtml,
                    variants: lastSearchedProductsVariants,
                    format: 'html_cards'
                } as any;
            }
            
            return { role: 'assistant', content: responseText };
        }

        return { role: 'assistant', content: responseMessage.content };
    } catch (error) {
        console.error("Lỗi trong getChatReply (OpenAI):", error);
        return { role: 'assistant', content: "Xin lỗi, hiện tại hệ thống AI đang quá tải. Bạn vui lòng đợi một chút rồi thử lại nhé!" };
    }
};

export const chatbotService = { getChatReply };