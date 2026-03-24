import OpenAI from 'openai';
import { env } from '../../../config/env';
import prisma from '../../../config/db';

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

// Lấy hoặc tạo payment method cho chatbot requests
const getOrCreateChatbotPaymentMethod = async (): Promise<string> => {
    try {
        let paymentMethod = await prisma.payment_methods.findUnique({
            where: { code: 'chatbot_request' },
            select: { id: true }
        });

        if (!paymentMethod) {
            console.log("📝 Creating payment method for chatbot requests...");
            paymentMethod = await prisma.payment_methods.create({
                data: {
                    name: 'Chatbot Request',
                    code: 'chatbot_request',
                    description: 'Phương thức thanh toán tạm thời cho yêu cầu từ chatbot, chờ xác nhận từ staff',
                    isActive: true
                },
                select: { id: true }
            });
            console.log(`✅ Payment method created: ${paymentMethod.id}`);
        }

        return paymentMethod.id;
    } catch (error) {
        console.error("❌ Lỗi khi lấy/tạo payment method:", error);
        throw new Error("Không thể tạo payment method cho đơn hàng");
    }
};

// ============================================================================
// 1. SYSTEM PROMPT
// ============================================================================
const SYSTEM_PROMPT = `Bạn là nhân viên tư vấn xuất sắc của Chợ Công Nghệ.

QUY TRÌNH TƯ VẤN & TẠO YÊU CẦU ĐẶT HÀNG:

Bước 1: Hiểu nhu cầu - Lắng nghe khách muốn mua gì.

Bước 2: Tìm sản phẩm - Gọi 'searchProducts'. Frontend sẽ tự động hiển thị cards UI. KHÔNG cần tự format lại danh sách.
   → Sau searchProducts, hãy nói: "Dưới đây là các phiên bản. Bạn muốn chọn cái nào?"

Bước 2.5: CHUYỂN BƯỚC NGAY KHI user nói "Tôi chọn phiên bản..." hoặc nói tên sản phẩm + màu + dung lượng cụ thể
   → Khi nhận ra user đã chọn sản phẩm cụ thể, KHÔNG GỌI searchProducts LẠI, chuyển sang Bước 3.

Bước 3: Chốt chi tiết & Lấy thông tin - Hỏi:
   - "Bạn chọn bao nhiêu chiếc?"
   - "Tên của bạn là gì?"
   - "Số điện thoại của bạn?"
   - "Địa chỉ nhận hàng chi tiết?"
   → Sau đó LẠI HỎI LẠI để confirm từng field: "Bạn có chắc là Họ Tên [X], SĐT [Y], Địa chỉ [Z] không?"

Bước 4: Chờ xác nhận cuối cùng - Khi khách nói "đúng", "ok", "được", "xong", "tạo đi", "đặt hàng đi" (BẤT KỲ CÂU XÁC NHẬN NÀO)
   → PHẢI GỌI 'createOrderRequest' NGAY LẬP TỨC, KHÔNG DÙNG TOOL TUỲ CHỌN.

CÁCH PHÁT HIỆN:
- User đã chọn sản phẩm: Nếu message chứa tên sản phẩm + màu hoặc dung lượng (VD: "iPhone 13 128GB Đen")
- User xác nhận: "đúng rồi", "ok", "được", "xong", "tạo đi", "đặt hàng", "chắc rồi", "vâng"

⚠️ **TRÁNH LỖI LẶP:**
✅ Nếu user đã chọn sản phẩm → KHÔNG GỌI searchProducts LẠI, chuyển sang bước 3 ngay
✅ Không bao giờ hỏi thêm sau khi user xác nhận cuối cùng
✅ Khi searchProducts trả về kết quả, frontend tự vẽ cards - bạn chỉ cần hướng dẫn
✅ Luôn thân thiện, lịch sự
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
            name: "createOrderRequest",
            description: "⭐ PHẢI GỌI NGAY KHI KHÁCH XÁC NHẬN ⭐ Tạo yêu cầu đặt hàng từ chatbot. Gọi tool này khi user nói 'đúng', 'ok', 'được', 'xong', hoặc bất kỳ lời xác nhận nào. NẾU KHÔNG GỌI TOOL NÀY, CHATBOT SẼ KHÔNG THỂ TẠO ĐƠN.",
            parameters: {
                type: "object",
                properties: {
                    customerName: { type: "string", description: "Họ tên người đặt hàng (lấy từ thông tin mà user cung cấp)" },
                    phone: { type: "string", description: "Số điện thoại người nhận (lấy từ thông tin user đã cung cấp)" },
                    email: { type: "string", description: "Email (tùy chọn, để trống nếu user không cung cấp)" },
                    address: { type: "string", description: "Địa chỉ nhận hàng chi tiết - cực kỳ quan trọng (lấy từ user)" },
                    productVariantId: { type: "string", description: "UUID của phiên bản sản phẩm đã chốt với user từ kết quả tìm kiếm" },
                    quantity: { type: "number", description: "Số lượng khách muốn đặt (default 1)" }
                },
                required: ["customerName", "phone", "address", "productVariantId", "quantity"],
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
            
            if (allMatchingProducts.length > 0) {
                console.log(`⚠️ Found ${allMatchingProducts.length} matching products but ALL are inactive/deleted:`, allMatchingProducts);
                const inactiveCount = allMatchingProducts.filter(p => !p.isActive).length;
                const deletedCount = allMatchingProducts.filter(p => p.deletedAt).length;
                const msg = `Sản phẩm '${keyword}' hiện không khả dụng (${inactiveCount} chưa kích hoạt, ${deletedCount} đã xóa). Vui lòng liên hệ admin để kích hoạt hoặc chọn sản phẩm khác.`;
                return { error: msg };
            } else {
                console.log(`❌ Không tìm thấy sản phẩm nào với từ khóa "${keyword}"`);
                return { error: `Không tìm thấy sản phẩm '${keyword}'. Vui lòng thử từ khóa khác.` };
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
                    <div class="product-card" data-variant-id="${v.id}" data-variant-name="${variantName}" data-variant-price="${finalPriceStr}đ">
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
            html: cardsHtml,
            format: 'html_cards',
            message: `Dưới đây là các phiên bản ${products[0]?.name || keyword} hiện có. Bạn muốn chọn phiên bản nào ạ?`,
            firstVariantId: firstVariantId,
            variants: variants
        };
    } catch (error) {
        console.error("Lỗi khi query DB Chatbot:", error);
        return { error: "Lỗi hệ thống khi tìm kiếm." };
    }
};

// 👉 TẠO YÊU CẦU ĐẶT HÀNG
const executeCreateOrderRequest = async (args: any) => {
    try {
        console.log("🚀 Tạo yêu cầu đặt hàng từ chatbot:", args);
        
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
        const orderCode = `CCN-${Math.random().toString(36).substring(7).toUpperCase()}`;
        const guestUserId = await getOrCreateGuestUser();
        const paymentMethodId = await getOrCreateChatbotPaymentMethod();
        
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

        // 4. TRẢ LẠI THÔNG TIN
        return {
            success: true,
            message: "✅ Yêu cầu của bạn đã được gửi! Staff sẽ xác nhận trong vòng 1-2 giờ. Bạn sẽ nhận được SMS khi đơn được tạo.",
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

// ============================================================================
// 4. UTILITIES - Detect confirmation & extract customer info
// ============================================================================

const isConfirmationMessage = (message: string): boolean => {
    const msg = message.trim().toLowerCase();
    const cleaned = msg.replace(/[.,?!;\s]/g, '');
    const confirmPatterns = /^(đúng|ok|được|xong|chạy|tạo|đặthàng|chắcrồi|vâng|ừ|có|chấpthuận|tạođi|đặtđi|tạongay|đượcrồi|chắcchắn|tôichắc|okrồi)$/;
    return confirmPatterns.test(cleaned);
};

const extractCustomerInfoFromHistory = (msgHistory: any[]): { name?: string; phone?: string; address?: string; productVariantId?: string } => {
    const result: any = {};
    
    for (let i = msgHistory.length - 1; i >= 0; i--) {
        const msg = msgHistory[i];
        if (msg.role === 'user' || msg.role === 'user') { // Note: Front-end usually sends 'user', keeping logic robust
            const text = msg.content || '';
            
            if (!result.phone) {
                const phoneMatch = text.match(/0[0-9]\d{8,}/);
                if (phoneMatch) result.phone = phoneMatch[0];
            }
            
            if (!result.address && text.length > 20) {
                const parts = text.split(/,\s*/);
                if (parts.length >= 3 && /0[0-9]\d{8,}/.test(parts[1])) {
                    const addressParts = parts.slice(2).join(', ').trim();
                    if (addressParts && addressParts.length > 5) result.address = addressParts;
                } else if (parts.length >= 2) {
                    const addressParts = parts.slice(1).join(', ').trim();
                    if (addressParts && addressParts.length > 5 && /\d+/.test(addressParts)) {
                        result.address = addressParts;
                    }
                }
            }
            
            if (!result.name) {
                const nameMatch = text.match(/^([a-zA-Zàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ\s]+)/i);
                if (nameMatch) {
                    result.name = nameMatch[1].trim().split(/[,\d]/)[0].trim();
                }
            }
        }
    }
    
    for (let i = msgHistory.length - 1; i >= 0; i--) {
        const msg = msgHistory[i];
        if ((msg.role === 'assistant' || msg.role === 'model') && msg.content) {
            const uuidMatch = msg.content.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
            if (uuidMatch) {
                result.productVariantId = uuidMatch[0];
                console.log(`✅ Found productVariantId: ${uuidMatch[0]}`);
                break;
            }
        }
    }
    
    console.log(`📋 Extract result: name="${result.name}", phone="${result.phone}", address="${result.address}", productVariantId="${result.productVariantId}"`);
    return result;
};

// ============================================================================
// 5. MAIN EXPORT (CHAT BOT LOGIC) - OPENAI INTEGRATION
// ============================================================================

let lastSearchedProductVariantId: string | null = null;
let lastSearchedProductsHtml: string | null = null;
let lastSearchedProductsVariants: any[] = [];

const getChatReply = async (userMessages: any[], selectedVariantId?: string) => {
    try {
        // 🔑 Nếu frontend gửi selectedVariantId, lưu lại
        if (selectedVariantId) {
            lastSearchedProductVariantId = selectedVariantId;
            console.log(`✅ Received selectedVariantId from frontend: ${selectedVariantId}`);
        }

        if (!userMessages || userMessages.length === 0) return { role: 'assistant', content: "Xin chào!" };

        const messagesCopy = [...userMessages];
        const latestMessage = messagesCopy.pop().content || " ";
        const historyMessages = messagesCopy.filter(msg => msg.role !== 'system');

        const confirming = isConfirmationMessage(latestMessage);
        console.log(`📌 User Message: "${latestMessage}" | Confirming: ${confirming}`);

        if (confirming) {
            console.log("🎯 CONFIRMATION DETECTED! Extracting info & creating order...");
            
            const customerInfo = extractCustomerInfoFromHistory(historyMessages);
            
            if (!customerInfo.productVariantId && lastSearchedProductVariantId) {
                customerInfo.productVariantId = lastSearchedProductVariantId;
                console.log(`📌 Using saved productVariantId: ${lastSearchedProductVariantId}`);
            }
            
            console.log("📊 Final Extracted Info:", customerInfo);
            
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
            
            const orderResult = await executeCreateOrderRequest({
                customerName: customerInfo.name,
                phone: customerInfo.phone,
                address: customerInfo.address,
                productVariantId: customerInfo.productVariantId,
                quantity: 1
            });
            
            if (orderResult.error) {
                return { role: 'assistant', content: orderResult.error };
            }
            
            lastSearchedProductVariantId = null;
            lastSearchedProductsHtml = null;
            lastSearchedProductsVariants = [];
            
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

            for (const toolCall of toolCalls) {
                const functionName = (toolCall as any).function?.name;
                const functionArgs = JSON.parse((toolCall as any).function?.arguments || '{}');
                let apiResponse: any;
                let toolResponseForAI: any; // Response nhẹ để gửi cho OpenAI

                if (functionName === "searchProducts") {
                    apiResponse = await executeSearchProducts(functionArgs);
                    
                    // ⚠️ FIX: Nếu search fail, LUÔN LUÔN reset state từ search cũ
                    if (apiResponse.error) {
                        console.warn(`🔄 Search FAILED for "${functionArgs.keyword}" - Resetting old search state`);
                        lastSearchedProductsHtml = null;
                        lastSearchedProductsVariants = [];
                        lastSearchedProductVariantId = null;
                        toolResponseForAI = { error: apiResponse.error };
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
                            note: "✅ Dữ liệu sản phẩm đã được gửi tới frontend. Bạn không cần liệt kê lại, chỉ cần hướng dẫn user chọn sản phẩm."
                        };
                    }
                } else if (functionName === "createOrderRequest") {
                    apiResponse = await executeCreateOrderRequest(functionArgs);
                    // Đối với createOrderRequest, trả full response vì cần thông tin xác nhận
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