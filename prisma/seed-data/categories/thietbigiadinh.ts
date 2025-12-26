export const thietBiGiaDinhData = [
  // ROOT Thiết bị gia đình & điện gia dụng
  {
    name: "Thiết bị gia đình & điện gia dụng",
    description:
      "Hệ thống các thiết bị điện tử gia dụng hiện đại, tối ưu công việc nội trợ và tiện ích sống.",
    categoryImage: "./images/categories/gia-dung.png",
  },
  // Quạt
  {
    name: "Quạt",
    description:
      "Giải pháp làm mát đa dạng từ quạt truyền thống đến quạt không cánh công nghệ cao.",
    categoryImage: "./images/categories/quat.png",
    parentName: "Thiết bị gia đình & điện gia dụng",
  },
  {
    name: "Quạt đứng",
    description:
      "Thiết kế cao, sải cánh rộng giúp luân chuyển luồng gió mát khắp không gian phòng lớn.",
    categoryImage: "./images/categories/quat-dung.png",
    parentName: "Quạt",
  },
  {
    name: "Quạt tháp",
    description: "Thiết kế trụ đứng sang trọng, tiết kiệm diện tích và vận hành cực kỳ êm ái.",
    categoryImage: "./images/categories/quat-thap.png",
    parentName: "Quạt",
  },
  {
    name: "Quạt sạc tích điện",
    description:
      "Giải pháp làm mát hữu hiệu trong những ngày mất điện hoặc mang đi dã ngoại tiện lợi.",
    categoryImage: "./images/categories/quat-sac.png",
    parentName: "Quạt",
  },
  {
    name: "Dyson",
    description:
      "Dòng quạt không cánh cao cấp, tích hợp lọc không khí và công nghệ khuếch tán gió an toàn.",
    categoryImage: "./images/categories/dyson.png",
    parentName: "Quạt",
  },
  // Quạt điều hòa
  {
    name: "Quạt điều hòa",
    description:
      "Làm mát bằng hơi nước tự nhiên, hạ nhiệt độ phòng nhanh chóng mà không gây khô da.",
    categoryImage: "./images/categories/quat-dieu-hoa.png",
    parentName: "Thiết bị gia đình & điện gia dụng",
  },
  {
    name: "Kangaroo",
    description:
      "Máy làm mát không khí Kangaroo với tấm làm mát hiệu quả và bình chứa nước dung tích lớn.",
    categoryImage: "./images/categories/kangaroo.png",
    parentName: "Quạt điều hòa",
  },
  {
    name: "Sunhouse",
    description:
      "Quạt điều hòa Sunhouse sở hữu động cơ bằng đồng bền bỉ và khả năng lọc bụi ấn tượng.",
    categoryImage: "./images/categories/sunhouse.png",
    parentName: "Quạt điều hòa",
  },
  // Máy lọc nước
  {
    name: "Máy lọc nước",
    description:
      "Hệ thống lọc RO/Nano tiên tiến mang lại nguồn nước tinh khiết, an toàn trực tiếp tại vòi.",
    categoryImage: "./images/categories/may-loc-nuoc.png",
    parentName: "Thiết bị gia đình & điện gia dụng",
  },
  {
    name: "Máy lọc nước tủ đứng",
    description:
      "Thiết kế truyền thống chắc chắn, tích hợp nhiều lõi lọc bổ sung khoáng chất cho cơ thể.",
    categoryImage: "./images/categories/loc-nuoc-dung.png",
    parentName: "Máy lọc nước",
  },
  {
    name: "Máy lọc nước lắp âm",
    description: "Thiết kế nhỏ gọn lắp dưới gầm chậu rửa, tối ưu diện tích cho gian bếp hiện đại.",
    categoryImage: "./images/categories/loc-nuoc-am.png",
    parentName: "Máy lọc nước",
  },
  {
    name: "Máy lọc nước để bàn",
    description:
      "Kích thước tinh gọn, phù hợp để trên bàn trà hoặc bàn bếp mà vẫn đảm bảo hiệu suất lọc.",
    categoryImage: "./images/categories/loc-nuoc-de-ban.png",
    parentName: "Máy lọc nước",
  },
  // Máy nước nóng
  {
    name: "Máy nước nóng",
    description:
      "Cung cấp nguồn nước ấm tức thì, bảo vệ sức khỏe khi tắm trong mọi điều kiện thời tiết.",
    categoryImage: "./images/categories/may-nuoc-nong.png",
    parentName: "Thiết bị gia đình & điện gia dụng",
  },
  {
    name: "Máy nước nóng trực tiếp",
    description:
      "Làm nóng nước ngay khi chảy qua máy, tích hợp bơm trợ lực cho luồng nước mạnh mẽ.",
    categoryImage: "./images/categories/nuoc-nong-truc-tiep.png",
    parentName: "Máy nước nóng",
  },
  {
    name: "Máy nước nóng gián tiếp",
    description:
      "Có bình chứa dung tích lớn, giữ nhiệt lâu và cực kỳ an toàn cho gia đình có bồn tắm.",
    categoryImage: "./images/categories/nuoc-nong-gian-tiep.png",
    parentName: "Máy nước nóng",
  },
  // Cây nước nóng lạnh
  {
    name: "Cây nước nóng lạnh",
    description: "Tiện ích 2 trong 1 giúp bạn có ngay nước nóng pha trà hoặc nước lạnh giải khát.",
    categoryImage: "./images/categories/cay-nuoc-nong-lanh.png",
    parentName: "Thiết bị gia đình & điện gia dụng",
  },
  {
    name: "Cây nước nóng lạnh úp bình",
    description:
      "Thiết kế đặt bình nước phía trên, dễ dàng theo dõi lượng nước còn lại trong bình.",
    categoryImage: "./images/categories/cay-nuoc-up.png",
    parentName: "Cây nước nóng lạnh",
  },
  {
    name: "Cây nước nóng lạnh hút bình",
    description:
      "Bình nước đặt bên trong thân máy, mang lại tính thẩm mỹ cao và dễ dàng thay bình.",
    categoryImage: "./images/categories/cay-nuoc-hut.png",
    parentName: "Cây nước nóng lạnh",
  },
  // Điện gia dụng
  {
    name: "Điện gia dụng",
    description:
      "Các thiết bị gia dụng thiết yếu phục vụ nhu cầu nấu nướng và sinh hoạt hàng ngày.",
    categoryImage: "./images/categories/dien-gia-dung.png",
    parentName: "Thiết bị gia đình & điện gia dụng",
  },
  {
    name: "Nồi chiên",
    description:
      "Nồi chiên không dầu giúp món ăn giòn tan, thơm ngon và giảm tới 80% lượng mỡ thừa.",
    categoryImage: "./images/categories/noi-chien.png",
    parentName: "Điện gia dụng",
  },
  {
    name: "Bình đun siêu tốc",
    description:
      "Đun sôi nước chỉ trong vài phút, tích hợp tính năng tự ngắt an toàn khi nước sôi.",
    categoryImage: "./images/categories/binh-dun.png",
    parentName: "Điện gia dụng",
  },
  {
    name: "Nồi áp suất điện",
    description:
      "Ninh hầm thực phẩm nhanh chóng, giữ trọn vẹn dinh dưỡng và tiết kiệm thời gian nấu.",
    categoryImage: "./images/categories/noi-ap-suat.png",
    parentName: "Điện gia dụng",
  },
  {
    name: "Bàn ủi",
    description:
      "Gồm bàn ủi khô và bàn ủi hơi nước, giúp quần áo phẳng phiu, sạch nếp nhăn tức thì.",
    categoryImage: "./images/categories/ban-ui.png",
    parentName: "Điện gia dụng",
  },
  {
    name: "Ổ cắm điện",
    description:
      "Thiết bị chia nguồn điện an toàn, chống quá tải và bảo vệ các thiết bị điện trong nhà.",
    categoryImage: "./images/categories/o-cam.png",
    parentName: "Điện gia dụng",
  },
  {
    name: "Máy rửa xe",
    description:
      "Áp lực nước cực mạnh giúp làm sạch xe cộ và sân vườn một cách nhanh chóng, hiệu quả.",
    categoryImage: "./images/categories/may-rua-xe.png",
    parentName: "Điện gia dụng",
  },
  // Sinh tố - xay vắt ép
  {
    name: "Sinh tố - xay vắt ép",
    description:
      "Bộ dụng cụ chuẩn bị đồ uống và sơ chế thực phẩm tươi ngon, bổ dưỡng cho gia đình.",
    categoryImage: "./images/categories/may-xay-ep.png",
    parentName: "Thiết bị gia đình & điện gia dụng",
  },
  {
    name: "Máy xay sinh tố",
    description:
      "Lưỡi dao sắc bén giúp xay nhuyễn trái cây, hạt và đá viên cho ly sinh tố hoàn hảo.",
    categoryImage: "./images/categories/may-xay.png",
    parentName: "Sinh tố - xay vắt ép",
  },
  {
    name: "Máy làm sữa hạt",
    description: "Chế biến các loại sữa hạt nguyên chất, thơm ngon với chế độ nấu và xay tự động.",
    categoryImage: "./images/categories/may-sua-hat.png",
    parentName: "Sinh tố - xay vắt ép",
  },
  {
    name: "Máy vắt cam",
    description: "Vắt sạch nước cam tươi nhanh chóng mà không gây đắng từ vỏ, giữ trọn vitamin C.",
    categoryImage: "./images/categories/may-vat-cam.png",
    parentName: "Sinh tố - xay vắt ép",
  },
  {
    name: "Máy ép hoa quả",
    description:
      "Công nghệ ép chậm giúp giữ lại màu sắc và hàm lượng dinh dưỡng cao nhất từ trái cây.",
    categoryImage: "./images/categories/may-ep.png",
    parentName: "Sinh tố - xay vắt ép",
  },
];
