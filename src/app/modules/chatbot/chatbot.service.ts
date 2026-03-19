import { GoogleGenerativeAI } from '@google/generative-ai';
import { FunctionDeclarationSchema } from '@google/generative-ai';
import { env } from '../../../config/env'; // Thay bằng đường dẫn file env của bạn
import prisma from '../../../config/db'; // Thay bằng đường dẫn DB Prisma của bạn

// 1. Khởi tạo Gemini Client
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY as string);

const SYSTEM_PROMPT = `Bạn là AI tư vấn bán hàng chuyên nghiệp cho website thương mại điện tử Chợ Công Nghệ.
Nhiệm vụ của bạn:
- Luôn trả lời bằng tiếng Việt, thân thiện, nhiệt tình.
- Chỉ tư vấn dựa trên dữ liệu hệ thống cung cấp (laptop, điện thoại, phụ kiện,...).
- TUYỆT ĐỐI KHÔNG tự bịa ra tên sản phẩm, thông số hoặc giá tiền.
- Nếu người dùng hỏi mua sản phẩm, hãy gọi công cụ tìm kiếm. Nếu không có, hãy xin lỗi và gợi ý sản phẩm khác.`;

// 2. Định nghĩa Tool (Function Calling) cho Gemini
const searchProductsTool: any = {
    name: "searchProducts",
    description: "Tìm kiếm thông tin sản phẩm đang bán trong cơ sở dữ liệu của cửa hàng bằng từ khoá.",
    parameters: {
        type: "object",
        properties: {
            keyword: {
                type: "string",
                description: "Từ khóa tìm kiếm sản phẩm (VD: 'Lenovo', 'iPhone 15', 'chuột')",
            }
        },
        required: ["keyword"],
    }
};

// 3. Hàm thực thi query Database bằng Prisma
// Hàm thực thi query Database bằng Prisma
const executeSearchProducts = async (keyword: string) => {
    try {
        const productsList = await prisma.products.findMany({
            where: {
                name: {
                    contains: keyword,
                    mode: 'insensitive', 
                },
                // Chỉ tìm các sản phẩm đang hiển thị và chưa bị xóa mềm
                isActive: true,
                deletedAt: null, 
            },
            select: {
                id: true,
                name: true,
                slug: true,
                // Lấy thêm thông tin giá từ bảng products_variants
                variants: {
                    where: {
                        isActive: true,
                        deletedAt: null
                    },
                    select: {
                        price: true,
                        quantity: true
                    },
                    take: 1 // Lấy giá của phiên bản mặc định/đầu tiên
                }
            },
            take: 4, 
        });

        if (productsList.length === 0) {
            return { message: `Hiện tại cửa hàng không có sản phẩm nào khớp với từ khóa '${keyword}'.` };
        }

        // Định dạng lại dữ liệu cho gọn gàng để AI dễ đọc hơn
        const formattedProducts = productsList.map(p => ({
            name: p.name,
            slug: p.slug,
            // Kiểm tra xem sản phẩm có variant không để báo giá
            price: p.variants.length > 0 ? Number(p.variants[0].price) : "Liên hệ để biết giá",
            inStock: p.variants.length > 0 && p.variants[0].quantity > 0 ? "Còn hàng" : "Hết hàng"
        }));

        return { products: formattedProducts }; 
    } catch (error) {
        console.error("Lỗi khi query DB Chatbot (Gemini):", error);
        return { error: "Hệ thống đang bảo trì phần tìm kiếm, vui lòng thử lại sau." };
    }
};

// 4. Logic xử lý Chat
const getChatReply = async (userMessages: any[]) => {
    // Tách câu hỏi cuối cùng của user ra để gửi riêng
    const latestMessage = userMessages.pop().content;

    // Chuyển đổi lịch sử chat từ chuẩn OpenAI (user/assistant) sang chuẩn Gemini (user/model)
    const formattedHistory = userMessages.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
    }));

    // Khởi tạo Model (dùng bản flash nhanh, nhẹ, rẻ và có function calling)
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ functionDeclarations: [searchProductsTool] }],
    });

    // Bắt đầu phiên chat với lịch sử cũ
    const chatSession = model.startChat({
        history: formattedHistory,
        generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 300,
        }
    });

    // Lần gọi 1: Gửi tin nhắn mới nhất cho AI
    const result = await chatSession.sendMessage(latestMessage);
    const responseCalls = result.response.functionCalls();

    // Kịch bản A: Nếu AI quyết định cần gọi hàm (User tìm sản phẩm)
    if (responseCalls && responseCalls.length > 0) {
        const call = responseCalls[0];
        
        if (call.name === "searchProducts") {
            const args = call.args as any;
            
            // Chạy query DB thật
            const dbResult = await executeSearchProducts(args.keyword);

            // Lần gọi 2: Gửi kết quả DB lại cho AI để nó tổng hợp câu trả lời
            const secondResult = await chatSession.sendMessage([{
                functionResponse: {
                    name: "searchProducts",
                    response: dbResult // Dữ liệu thật từ Prisma
                }
            }]);

            return {
                role: 'assistant',
                content: secondResult.response.text(),
            };
        }
    }

    // Kịch bản B: Trả lời bình thường (User chỉ chào hỏi)
    return {
        role: 'assistant',
        content: result.response.text(),
    };
};

export const chatbotService = {
    getChatReply,
};