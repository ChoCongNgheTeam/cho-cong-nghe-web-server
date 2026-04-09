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
            description: "Từ khóa tìm kiếm tên sản phẩm. VD: 'iphone 15', 'laptop gaming', 'tai nghe chống ồn'",
          },
          categorySlug: {
            type: "string",
            description: `Slug danh mục sản phẩm. Các giá trị phổ biến:
              - 'dien-thoai': điện thoại smartphone
              - 'laptop': máy tính xách tay
              - 'tai-nghe': tai nghe
              - 'may-tinh-bang': máy tính bảng
              - 'phu-kien': phụ kiện (sạc, cáp, ốp lưng...)
              Chỉ điền nếu biết chắc danh mục, không đoán mò.`,
          },
          brandSlug: {
            type: "string",
            description: "Slug thương hiệu nếu khách chỉ định. VD: 'apple', 'samsung', 'sony', 'xiaomi', 'dell', 'asus'",
          },
          minPrice: {
            type: "number",
            description: "Giá tối thiểu (VND). VD: 5000000 cho 5 triệu",
          },
          maxPrice: {
            type: "number",
            description: "Giá tối đa (VND). VD: 10000000 cho 10 triệu. Khi khách nói 'tầm X triệu' thì dùng maxPrice = X*1.1 triệu để có margin.",
          },
          storage: {
            type: "string",
            description: "Dung lượng bộ nhớ trong (variant attribute). VD: '128GB', '256GB', '512GB', '1TB'",
          },
          color: {
            type: "string",
            description: "Màu sắc (variant attribute). VD: 'black', 'white', 'blue', 'titanium'",
          },
          specsFilter: {
            type: "object",
            description: `Lọc theo thông số kỹ thuật trong DB (product_specifications).
              Key là specification key, value là giá trị cần lọc.
              
              Dùng prefix spec_ cho các thông số đặc biệt:
              - BOOLEAN (có/không): { "spec_nfc": "true", "spec_5g": "true" }
              - RANGE min: { "spec_battery_capacity_min": "4000" }
              - RANGE max: { "spec_screen_size_max": "6.5" }
              - ENUM: { "spec_os": "Android" }
              
              Không dùng prefix cho thông số thông thường:
              - RAM: { "ram": "16 GB" } — chú ý có space giữa số và đơn vị
              - Màn hình: { "screen_refresh_rate": "120Hz" }
              - Camera: { "camera_main": "50.0 MP" }
              
              CHÚ Ý FORMAT VALUE (phải khớp chính xác với DB):
              - RAM: "8 GB", "16 GB", "32 GB" (có space)
              - Pin: "4000 mAh", "5000 mAh" (có space)
              - Camera: "50.0 MP", "108.0 MP" (có .0)
              - Màn hình Hz: "120Hz", "144Hz" (không space)
              - Nếu không chắc format → KHÔNG dùng specsFilter, để AI lọc từ kết quả`,
            additionalProperties: {
              type: "string",
            },
          },
          attrsFilter: {
            type: "object",
            description: `Lọc theo thuộc tính variant (variants_attributes).
              Key là attribute code, value là string hoặc mảng string (OR logic).
              Các key phổ biến: "storage" (bộ nhớ), "ram" (RAM laptop/tablet), "color" (màu)
              VD: { "storage": "256GB" } hoặc { "storage": ["128GB", "256GB"] }
              VD: { "ram": "16GB" }`,
            additionalProperties: {
              oneOf: [
                { type: "string" },
                { type: "array", items: { type: "string" } },
              ],
            },
          },
          limit: {
            type: "number",
            description: "Số lượng kết quả trả về. Mặc định 5, tối đa 10. Dùng 8-10 khi khách muốn 'vài mẫu'.",
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
      description: "Lấy thông tin chi tiết một sản phẩm cụ thể: toàn bộ thông số kỹ thuật, variants và giá từng phiên bản. Gọi khi khách hỏi chi tiết về 1 sản phẩm cụ thể.",
      parameters: {
        type: "object",
        properties: {
          slug: {
            type: "string",
            description: "Slug của sản phẩm lấy từ kết quả search_products. VD: 'iphone-15-pro-max-256gb'",
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
      description: "Lấy danh sách khuyến mãi đang chạy. Gọi khi khách hỏi về sale, giảm giá, ưu đãi, khuyến mãi hiện tại.",
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
            description: "Loại chính sách: WARRANTY=bảo hành, RETURN=đổi trả, DELIVERY=giao hàng, INSTALLMENT=trả góp, LOYALTY=tích điểm",
          },
        },
        required: ["policyType"],
      },
    },
  },
];