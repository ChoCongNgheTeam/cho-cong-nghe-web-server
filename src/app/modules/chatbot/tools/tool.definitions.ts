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
      LƯU Ý NGÂN SÁCH VÀ TỪ KHÓA (BẮT BUỘC QUY ĐỔI RA VNĐ, 1 triệu = 1000000, VÀ BẮT BUỘC PHẢI LÀ SỐ NGUYÊN NUMBER, KHÔNG BỌC TRONG NGOẶC KÉP): 
      - Khách nói "tầm/khoảng X triệu" -> BẮT BUỘC truyền CẢ 2 tham số: minPrice = X * 0.8 * 1000000 và maxPrice = X * 1.2 * 1000000. (VD: "tầm 300 triệu" -> minPrice = 240000000, maxPrice = 360000000).
      - "dưới X triệu" -> minPrice = 0, maxPrice = X * 1000000.
      - "từ X đến Y triệu" -> minPrice = X * 1000000, maxPrice = Y * 1000000.
      - "giá tốt/rẻ nhất" -> KHÔNG dùng maxPrice, bắt buộc dùng sortBy = "PRICE_ASC"
      - "cao cấp/đắt nhất" -> KHÔNG dùng maxPrice, bắt buộc dùng sortBy = "PRICE_DESC"
      - "hot nhất/bán chạy nhất/nhiều người mua" -> BẮT BUỘC dùng sortBy = "BEST_SELLING"
      - KHÁCH HỎI TÌM "SẢN PHẨM SALE/GIẢM GIÁ" -> BẮT BUỘC GỌI TOOL NÀY. Nếu khách không nói rõ loại máy, hãy để trống các tham số để lấy top.
      - QUAN TRỌNG: NẾU KHÁCH HỎI ĐÍCH DANH 1 DÒNG MÁY CỤ THỂ (VD: "có Z Fold 7 không?", "giá iPhone 15") -> Gọi tool này để tìm máy. Nếu tìm thấy, BẮT BUỘC lấy 'slug' đó gọi tiếp tool 'get_product_detail' để lấy danh sách các phiên bản (variants) báo giá chi tiết cho khách.
      - NẾU SEARCH LẦN 1 KHÔNG RA KẾT QUẢ: Thử lại với keyword ngắn hơn (chỉ giữ thương hiệu, bỏ hết phần còn lại) và vẫn giữ categorySlug.`,
      parameters: {
        type: "object",
        properties: {
          semanticQuery: {
            type: "string",
            description: `Nhu cầu hoặc ý định tìm kiếm của khách hàng, được viết bằng ngôn ngữ tự nhiên. 
VD: "điện thoại chụp hình đẹp ban đêm", "laptop chơi game mượt mà không nóng", "dành cho người lớn tuổi", "pin trâu".
NẾU khách hỏi đích danh tên máy (VD: "iPhone 15 Pro Max"), hãy truyền tên máy vào đây.
QUAN TRỌNG VỚI CÁC TỪ CHỦ QUAN:
- Nếu khách yêu cầu "chụp hình đẹp", "chơi game mượt", "cao cấp": HÃY KẾT HỢP với \`minPrice: 15000000\` để AI lọc ra máy xịn (Flagship).
- Nếu khách yêu cầu "giá rẻ", "chữa cháy": KẾT HỢP với \`maxPrice: 5000000\`.
Tuyệt đối không để giá cả, hãng vào chuỗi này, hãy dùng minPrice/maxPrice/brandSlug để lọc.`,
          },
           categorySlug: {
            type: "string",
            description: `BẮT BUỘC ánh xạ theo bảng chi tiết sau (Lưu ý: "dt", "đt" nghĩa là điện thoại; "lap" là laptop):
[ĐIỆN THOẠI] (dt, đt, smartphone): smartphone chung(dien-thoai), iPhone(apple-iphone), Samsung(samsung), Xiaomi/Redmi/Poco(xiaomi), OPPO(oppo).
[LAPTOP]: laptop chung(laptop), MacBook(apple-macbook), Gaming Asus(asus-tuf-gaming hoặc asus-rog), Văn phòng Asus(asus-zenbook hoặc asus-vivobook), Gaming Lenovo(lenovo-legion-gaming hoặc lenovo-gaming-loq), Lenovo thường(lenovo-ideapad hoặc lenovo-thinkbook), Gaming Acer(acer-nitro hoặc acer-predator), Gaming Dell(dell-gaming-g-series), Gaming HP(hp-victus hoặc hp-omen), HP mỏng nhẹ(hp-envy).
[ĐIỆN MÁY]: Tivi(tivi), Máy giặt(may-giat), Máy lạnh/điều hòa(may-lanh-dieu-hoa), Tủ lạnh(tu-lanh), Máy sấy quần áo(may-say), Tủ đông(tu-dong).
[TAI NGHE/LOA]: Bluetooth/Không dây/TWS/ANC(tai-nghe-khong-day), Nhét tai/earbud/in-ear(tai-nghe-nhet-tai), Chụp tai/over-ear(tai-nghe-chup-tai), Headset gaming(tai-nghe), Loa bluetooth/di động(loa-bluetooth), Loa karaoke(loa-karaoke), Loa vi/máy tính(loa-vi-tinh).
[CHUỘT/PHÍM]: Chuột gaming(chuot), Chuột văn phòng(chuot-2), Bàn phím gaming/cơ(ban-phim), Bàn phím văn phòng(ban-phim-2).
[PHỤ KIỆN KHÁC]: Sạc/Pin dự phòng(sac-du-phong), Củ/Cáp sạc(sac-cap), Ốp lưng/bao da(bao-da-op-lung), Dán màn hình(mieng-dan-man-hinh), Bút cảm ứng(but-cam-ung), Webcam(webcam), Hub/USB hub(hub-chuyen-doi), Giá đỡ laptop(gia-do), Balo/túi xách(balo-tui-xach), Miếng lót chuột(mieng-lot-chuot).`,
          },

          brandSlug: {
            type: "string"},

          minPrice: { type: "number", description: "Số nguyên (number), tuyệt đối không dùng string có ngoặc kép." },
          maxPrice: { type: "number", description: "Số nguyên (number), tuyệt đối không dùng string có ngoặc kép." },
          sortBy: {
            type: "string",
            enum: ["PRICE_ASC", "PRICE_DESC", "BEST_SELLING"],
          },
          storage: { type: "string" },
          color: { type: "string" },
          specsFilter: {
            type: "string",
            description: `Lọc thông số kỹ thuật. Chỉ dùng khi CHẮC CHẮN format đúng với DB.
FORMAT CHUẨN theo từng danh mục:
- Điện thoại / Laptop: RAM: "8 GB", Pin: "5000 mAh", Camera: "50.0 MP", Hz: "120Hz"
- Máy lạnh: Công suất (HP): "1 HP", "1.5 HP", "2 HP"
- Máy giặt: Khối lượng giặt (kg): "8 kg", "10 kg"
- Tivi: Kích thước màn hình: "65 inch", "55 inch"
KHÔNG dùng để đoán các tính từ chủ quan ("chụp đẹp", "pin trâu"). Tính từ chủ quan phải dùng semanticQuery + minPrice/maxPrice.
Chỉ dùng specsFilter khi khách yêu cầu CON SỐ CỤ THỂ (VD: "RAM 8GB", "Camera 50MP"). KHÔNG CHẮC CHẮN → KHÔNG DÙNG.
(QUAN TRỌNG: TRẢ VỀ DƯỚI DẠNG CHUỖI JSON, ví dụ: "{\\"RAM\\":\\"8 GB\\"}")`,
          },
          attrsFilter: {
            type: "string",
            description: "Lọc variant. VD: Khách hỏi 'iPhone 15 128GB' -> keyword='iPhone 15', attrsFilter='{\"storage\":\"128GB\"}' (QUAN TRỌNG: TRẢ VỀ DƯỚI DẠNG CHUỖI JSON)",
          },
          limit: { type: "number", description: "Số lượng kết quả (number), không dùng string. Mặc định 5, tối đa 10." },
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