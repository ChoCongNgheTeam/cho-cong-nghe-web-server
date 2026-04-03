import OpenAI from "openai";

// ============================================================
// TOOL DEFINITIONS — OpenAI Function Calling Schema
// AI sẽ tự quyết định khi nào gọi tool nào, không hardcode
// ============================================================

export const CHATBOT_TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_products",
      description: "Tìm kiếm sản phẩm theo nhu cầu của khách hàng. Gọi khi khách hỏi về sản phẩm, so sánh, gợi ý mua hàng.",
      parameters: {
        type: "object",
        properties: {
          keyword: {
            type: "string",
            description: "Từ khóa tìm kiếm. VD: 'iphone 15', 'laptop gaming', 'tai nghe chống ồn'",
          },
          categorySlug: {
            type: "string",
            description: "Slug danh mục nếu biết. VD: 'dien-thoai', 'laptop', 'tai-nghe'",
          },
          brandSlug: {
            type: "string",
            description: "Slug thương hiệu. VD: 'apple', 'samsung', 'sony'",
          },
          minPrice: {
            type: "number",
            description: "Giá tối thiểu (VND)",
          },
          maxPrice: {
            type: "number",
            description: "Giá tối đa (VND)",
          },
          storage: {
            type: "string",
            description: "Dung lượng bộ nhớ. VD: '128GB', '256GB', '512GB'",
          },
          color: {
            type: "string",
            description: "Màu sắc sản phẩm. VD: 'black', 'white', 'blue'",
          },
          limit: {
            type: "number",
            description: "Số lượng kết quả trả về, mặc định 5, tối đa 10",
          },
        },
        required: ["keyword"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_product_detail",
      description: "Lấy thông tin chi tiết một sản phẩm cụ thể: thông số kỹ thuật, variants, giá từng phiên bản. Gọi khi khách hỏi chi tiết về 1 sản phẩm.",
      parameters: {
        type: "object",
        properties: {
          slug: {
            type: "string",
            description: "Slug của sản phẩm. VD: 'iphone-15-pro-max-256gb'",
          },
        },
        required: ["slug"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_active_promotions",
      description: "Lấy danh sách khuyến mãi đang chạy. Gọi khi khách hỏi về sale, giảm giá, ưu đãi, khuyến mãi.",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Số lượng khuyến mãi trả về, mặc định 5",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_policy",
      description: "Lấy nội dung chính sách của shop. Gọi khi khách hỏi về bảo hành, đổi trả, giao hàng, thanh toán, trả góp...",
      parameters: {
        type: "object",
        properties: {
          policyType: {
            type: "string",
            enum: ["WARRANTY", "RETURN", "DELIVERY", "DELIVERY_INSTALLATION", "INSTALLMENT", "LOYALTY", "PRIVACY", "TECHNICAL_SUPPORT", "UNBOXING"],
            description: "Loại chính sách cần tra cứu. WARRANTY=bảo hành, RETURN=đổi trả, DELIVERY=giao hàng, INSTALLMENT=trả góp",
          },
        },
        required: ["policyType"],
      },
    },
  },
];
