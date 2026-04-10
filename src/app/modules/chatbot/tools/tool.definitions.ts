import OpenAI from "openai";

// ============================================================
// TOOL DEFINITIONS — Service Layer
// Chứa toàn bộ luật nghiệp vụ và BẢNG MAPPING CHI TIẾT
// ============================================================

export const CHATBOT_TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_products",
      description: `Tìm kiếm sản phẩm. 
      LƯU Ý NGÂN SÁCH: 
      - Khách nói "tầm/khoảng X triệu" -> maxPrice = X * 1.1 triệu
      - "dưới X triệu" -> maxPrice = X triệu
      - "giá tốt/rẻ nhất" -> KHÔNG dùng maxPrice, bắt buộc dùng sortBy = "PRICE_ASC"
      - "cao cấp/đắt nhất" -> KHÔNG dùng maxPrice, bắt buộc dùng sortBy = "PRICE_DESC"`,
      parameters: {
        type: "object",
        properties: {
          keyword: {
            type: "string",
            description: `Từ khóa tìm kiếm (Chỉ lấy TÊN GỐC). KHÔNG đưa dung lượng (128GB) hay từ khóa giá ('giá tốt'). 
BẮT BUỘC DÙNG KEYWORD CHUẨN NẾU KHÁCH HỎI CÁC MẶT HÀNG SAU:
- Tai nghe bluetooth / TWS -> keyword: "tai nghe bluetooth"
- Tai nghe ANC / chống ồn -> keyword: "tai nghe chống ồn"
- Chuột gaming / chơi game -> keyword: "chuột gaming"
- Chuột không/có dây văn phòng -> keyword: "chuột không dây" hoặc "chuột"
- Bàn phím cơ / gaming -> keyword: "bàn phím cơ" hoặc "bàn phím gaming"
- Bàn phím không/có dây văn phòng -> keyword: "bàn phím không dây" hoặc "bàn phím"
Nếu khách chỉ hỏi danh mục chung chung ('có máy lạnh không', 'tìm điện thoại') -> ĐỂ TRỐNG TRƯỜNG NÀY.`,
          },
          categorySlug: {
            type: "string",
            description: `BẮT BUỘC ánh xạ theo bảng chi tiết sau:
[ĐIỆN THOẠI]: smartphone chung(dien-thoai), iPhone(apple-iphone), Samsung(samsung), Xiaomi/Redmi/Poco(xiaomi), OPPO(oppo).
[LAPTOP]: laptop chung(laptop), MacBook(apple-macbook), Gaming Asus(asus-tuf-gaming hoặc asus-rog), Văn phòng Asus(asus-zenbook hoặc asus-vivobook), Gaming Lenovo(lenovo-legion-gaming hoặc lenovo-gaming-loq), Lenovo thường(lenovo-ideapad hoặc lenovo-thinkbook), Gaming Acer(acer-nitro hoặc acer-predator), Gaming Dell(dell-gaming-g-series), Gaming HP(hp-victus hoặc hp-omen), HP mỏng nhẹ(hp-envy).
[ĐIỆN MÁY]: Tivi(tivi), Máy giặt(may-giat), Máy lạnh/điều hòa(may-lanh-dieu-hoa), Tủ lạnh(tu-lanh), Máy sấy quần áo(may-say), Tủ đông(tu-dong).
[TAI NGHE/LOA]: Bluetooth/Không dây/TWS/ANC(tai-nghe-khong-day), Nhét tai/earbud/in-ear(tai-nghe-nhet-tai), Chụp tai/over-ear(tai-nghe-chup-tai), Headset gaming(tai-nghe), Loa bluetooth/di động(loa-bluetooth), Loa karaoke(loa-karaoke), Loa vi/máy tính(loa-vi-tinh).
[CHUỘT/PHÍM]: Chuột gaming(chuot), Chuột văn phòng(chuot-2), Bàn phím gaming/cơ(ban-phim), Bàn phím văn phòng(ban-phim-2).
[PHỤ KIỆN KHÁC]: Sạc/Pin dự phòng(sac-du-phong), Củ/Cáp sạc(sac-cap), Ốp lưng/bao da(bao-da-op-lung), Dán màn hình(mieng-dan-man-hinh), Bút cảm ứng(but-cam-ung), Webcam(webcam), Hub/USB hub(hub-chuyen-doi), Giá đỡ laptop(gia-do), Balo/túi xách(balo-tui-xach), Miếng lót chuột(mieng-lot-chuot).`,
          },
          brandSlug: { type: "string" },
          minPrice: { type: "number" },
          maxPrice: { type: "number" },
          sortBy: {
            type: "string",
            enum: ["PRICE_ASC", "PRICE_DESC", "BEST_SELLING"],
          },
          storage: { type: "string" },
          color: { type: "string" },
          specsFilter: {
            type: "object",
            description: "Lọc thông số. FORMAT DB: RAM: '8 GB', Pin: '5000 mAh', Camera: '50.0 MP', Hz: '120Hz'. KHÔNG chắc chắn format thì KHÔNG dùng.",
            additionalProperties: { type: "string" },
          },
          attrsFilter: {
            type: "object",
            description: "Lọc variant. VD Tách bộ nhớ khỏi tên máy: Khách hỏi 'iPhone 15 128GB' -> truyền keyword='iPhone 15', attrsFilter={ 'storage': '128GB' }",
            additionalProperties: {
              oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }],
            },
          },
          limit: { type: "number", description: "Số lượng kết quả, mặc định 5, tối đa 10." },
        },
        required: [], 
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_product_detail",
      description: "Lấy thông tin chi tiết một sản phẩm cụ thể bằng slug.",
      parameters: {
        type: "object",
        properties: { slug: { type: "string" } },
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
        properties: { limit: { type: "number" } },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_policy",
      description: "Lấy nội dung chính sách của shop (bảo hành, đổi trả, giao hàng...).",
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