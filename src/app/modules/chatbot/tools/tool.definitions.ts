import OpenAI from "openai";

// ============================================================
// TOOL DEFINITIONS — OpenAI Function Calling Schema
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
            description: "Từ khóa tìm kiếm tên sản phẩm. NẾU KHÁCH HỎI CHUNG CHUNG DANH MỤC (VD: 'có máy lạnh không', 'tìm điện thoại') -> HÃY ĐỂ TRỐNG TRƯỜNG NÀY và chỉ truyền categorySlug.",
          },
          categorySlug: {
            type: "string",
            description: `Slug danh mục. Chọn slug PHÙ HỢP NHẤT với yêu cầu khách:

ĐIỆN THOẠI: 'dien-thoai', 'apple-iphone', 'samsung', 'xiaomi', 'oppo'
LAPTOP: 'laptop', 'apple-macbook', 'asus-tuf-gaming', 'asus-rog', 'asus-zenbook', 'asus-vivobook', 'lenovo-legion-gaming', 'lenovo-gaming-loq', 'lenovo-thinkbook', 'lenovo-ideapad', 'acer-nitro', 'acer-predator', 'dell-gaming-g-series', 'hp-victus', 'hp-omen', 'hp-envy'
ĐIỆN MÁY: 'tivi', 'may-giat', 'may-lanh-dieu-hoa', 'tu-lanh', 'may-say', 'tu-dong'
TAI NGHE & LOA: 'tai-nghe-nhet-tai', 'tai-nghe-chup-tai', 'tai-nghe-khong-day', 'tai-nghe', 'loa-bluetooth', 'loa-karaoke', 'loa-vi-tinh'
CHUỘT: 'chuot' (gaming), 'chuot-2' (văn phòng)
BÀN PHÍM: 'ban-phim' (gaming/cơ), 'ban-phim-2' (văn phòng)
PHỤ KIỆN DI ĐỘNG: 'sac-cap', 'sac-du-phong', 'bao-da-op-lung', 'mieng-dan-man-hinh', 'but-cam-ung'
PHỤ KIỆN LAPTOP: 'webcam', 'hub-chuyen-doi', 'gia-do', 'balo-tui-xach', 'mieng-lot-chuot'`,
          },
          brandSlug: {
            type: "string",
            description: "Slug thương hiệu nếu khách chỉ định.",
          },
          minPrice: {
            type: "number",
            description: "Giá tối thiểu (VND).",
          },
          maxPrice: {
            type: "number",
            description: "Giá tối đa (VND).",
          },
          sortBy: {
            type: "string",
            enum: ["PRICE_ASC", "PRICE_DESC", "BEST_SELLING"],
            description: "Nếu khách hỏi 'giá tốt', 'giá rẻ', 'rẻ nhất' -> dùng 'PRICE_ASC'. Nếu hỏi 'cao cấp', 'đắt nhất' -> dùng 'PRICE_DESC'.",
          },
          storage: {
            type: "string",
            description: "Dung lượng bộ nhớ trong (variant attribute). VD: '128GB', '256GB'",
          },
          color: {
            type: "string",
            description: "Màu sắc (variant attribute). VD: 'black', 'white'",
          },
          specsFilter: {
            type: "object",
            description: `Lọc theo thông số kỹ thuật (product_specifications).`,
            additionalProperties: { type: "string" },
          },
          attrsFilter: {
            type: "object",
            description: `Lọc theo thuộc tính variant. VD: { "storage": "256GB" }`,
            additionalProperties: {
              oneOf: [
                { type: "string" },
                { type: "array", items: { type: "string" } },
              ],
            },
          },
          limit: {
            type: "number",
            description: "Số lượng kết quả. Mặc định 5, tối đa 10.",
          },
        },
        required: [], // Đã xóa "keyword" khỏi mảng này để fix lỗi máy lạnh
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_product_detail",
      description: "Lấy thông tin chi tiết một sản phẩm cụ thể.",
      parameters: {
        type: "object",
        properties: {
          slug: { type: "string" },
        },
        required: ["slug"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_active_promotions",
      description: "Lấy danh sách khuyến mãi đang chạy.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_policy",
      description: "Lấy nội dung chính sách của shop.",
      parameters: {
        type: "object",
        properties: {
          policyType: {
            type: "string",
            enum: ["WARRANTY", "RETURN", "DELIVERY", "DELIVERY_INSTALLATION", "INSTALLMENT", "LOYALTY", "PRIVACY", "TECHNICAL_SUPPORT", "UNBOXING"],
          },
        },
        required: ["policyType"],
      },
    },
  },
];