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
      LƯU Ý NGÂN SÁCH VÀ TỪ KHÓA: 
      - Khách nói "tầm/khoảng X triệu" -> maxPrice = X * 1.1 triệu
      - "dưới X triệu" -> maxPrice = X triệu
      - "giá tốt/rẻ nhất" -> KHÔNG dùng maxPrice, bắt buộc dùng sortBy = "PRICE_ASC"
      - "cao cấp/đắt nhất" -> KHÔNG dùng maxPrice, bắt buộc dùng sortBy = "PRICE_DESC"
      - "hot nhất/bán chạy nhất/nhiều người mua" -> BẮT BUỘC dùng sortBy = "BEST_SELLING"
      - KHÁCH HỎI TÌM "SẢN PHẨM SALE/GIẢM GIÁ" -> BẮT BUỘC GỌI TOOL NÀY. Nếu khách không nói rõ loại máy, hãy để trống các tham số để lấy top.
      - QUAN TRỌNG: NẾU KHÁCH HỎI ĐÍCH DANH 1 DÒNG MÁY CỤ THỂ (VD: "có Z Fold 7 không?", "giá iPhone 15") -> Gọi tool này để tìm máy. Nếu tìm thấy, BẮT BUỘC lấy 'slug' đó gọi tiếp tool 'get_product_detail' để lấy danh sách các phiên bản (variants) báo giá chi tiết cho khách.
      - NẾU SEARCH LẦN 1 KHÔNG RA KẾT QUẢ: Thử lại với keyword ngắn hơn (chỉ giữ thương hiệu, bỏ hết phần còn lại) và vẫn giữ categorySlug.`,
      parameters: {
        type: "object",
        properties: {
          keyword: {
            type: "string",
            description: `Từ khóa tìm kiếm — CHỈ gồm THƯƠNG HIỆU và TÊN DÒNG SẢN PHẨM CHÍNH.

QUY TẮC BẮT BUỘC — LOẠI BỎ HOÀN TOÀN các thành phần sau khỏi keyword:
- Model code / mã sản phẩm: N9ZKH-8, YZ9WKH-8, QN65Q80C, FV1410S4W...
- Công suất: 1 HP, 1.5 HP, 2 HP...
- BTU: 9.000 BTU, 12.000 BTU... (kể cả trong dấu ngoặc)
- Dung lượng: 128GB, 256GB, 8GB RAM...
- Kích thước: 65 inch, 55"...
- Ký tự đặc biệt: (~...), [...], dấu phẩy, dấu gạch ngang trong mã máy
- Số chiều điều hòa: "1 chiều", "2 chiều"
- Công nghệ đi kèm: Inverter, QLED, OLED (trừ khi là tên dòng thực sự)

VÍ DỤ ĐÚNG:
❌ SAI: "Máy lạnh Panasonic 2 chiều Inverter YZ9WKH-8 1 HP (~9.000 BTU)"
✅ ĐÚNG: keyword="Máy lạnh Panasonic" + categorySlug="may-lanh-dieu-hoa"

❌ SAI: "Tivi Samsung 65 inch QLED 4K QN65Q80C"
✅ ĐÚNG: keyword="Tivi Samsung" + categorySlug="tivi"

❌ SAI: "Máy giặt LG Inverter 10kg FV1410S4W"
✅ ĐÚNG: keyword="Máy giặt LG" + categorySlug="may-giat"

❌ SAI: "iPhone 15 Pro Max 256GB"
✅ ĐÚNG: keyword="iPhone 15 Pro Max" + categorySlug="iphone-15-series"

❌ SAI: "Laptop Lenovo IdeaPad 5 i5-1235U 8GB 512GB"
✅ ĐÚNG: keyword="Laptop Lenovo IdeaPad 5" + categorySlug="lenovo-ideapad"

❌ SAI: "Tai nghe Sony WH-1000XM5 chống ồn"
✅ ĐÚNG: keyword="Sony WH-1000XM5" + categorySlug="tai-nghe-khong-day" + brandSlug="sony"

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

          brandSlug: {
            type: "string"},

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
            description: `Lọc thông số kỹ thuật. Chỉ dùng khi CHẮC CHẮN format đúng với DB.
FORMAT CHUẨN theo từng danh mục:
- Điện thoại / Laptop: RAM: "8 GB", Pin: "5000 mAh", Camera: "50.0 MP", Hz: "120Hz"
- Máy lạnh: Công suất (HP): "1 HP", "1.5 HP", "2 HP"
- Máy giặt: Khối lượng giặt (kg): "8 kg", "10 kg"
- Tivi: Kích thước màn hình: "65 inch", "55 inch"
KHÔNG chắc chắn format → KHÔNG dùng, tránh lọc sai.`,
            additionalProperties: { type: "string" },
          },
          attrsFilter: {
            type: "object",
            description: "Lọc variant. VD: Khách hỏi 'iPhone 15 128GB' -> keyword='iPhone 15', attrsFilter={ 'storage': '128GB' }",
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
      description: `Lấy danh sách chương trình khuyến mãi đang chạy.
      LƯU Ý QUAN TRỌNG:
      1. NẾU khách yêu cầu TÌM MÁY/SẢN PHẨM (VD: "sản phẩm đang sale", "điện thoại nào giảm giá", "máy nào hot"), TUYỆT ĐỐI KHÔNG dùng tool này (hãy dùng search_products).
      2. CHỈ dùng tool này khi khách hỏi thông tin chung về chương trình (VD: "shop có đang chạy sale gì không?", "có chương trình ưu đãi nào không?").
      3. Khi có kết quả, phải chuyển tên chương trình thành tiếng Việt tự nhiên, KHÔNG đọc y nguyên mã code cho khách.`,
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
      description: `Lấy nội dung chính sách của shop.
      ÁNH XẠ NHU CẦU KHÁCH → policyType:
      - Bảo hành, lỗi máy, đổi máy mới → WARRANTY
      - Đổi trả, hoàn tiền, trả hàng → RETURN
      - Giao hàng, ship, thời gian nhận hàng → DELIVERY
      - Giao hàng + lắp đặt (điện máy, tivi, máy lạnh...) → DELIVERY_INSTALLATION
      - Trả góp, mua trả góp, trả góp 0%, góp lãi suất → INSTALLMENT
      - Tích điểm, thành viên, loyalty, điểm thưởng → LOYALTY
      - Chính sách riêng tư, bảo mật dữ liệu → PRIVACY
      - Hỗ trợ kỹ thuật, sửa chữa → TECHNICAL_SUPPORT
      - Mở hộp, unbox, kiểm tra hàng khi nhận → UNBOXING`,
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