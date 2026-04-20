import { AddressType } from "@prisma/client";

// provincesData và wardsData đã xóa — không còn bảng trong DB

export const userAddressesData = [
  {
    contactName: "Khách Hàng Hà Nội",
    phone: "0909123456",
    detailAddress: "123 Phố Huế",
    type: AddressType.HOME,
    isDefault: true,
    provinceCode: 1,        // Hà Nội (integer, theo external API)
    provinceName: "Thủ đô Hà Nội",
    wardCode: 1006,         // Phường Hoàn Kiếm (integer, theo external API)
    wardName: "Phường Hoàn Kiếm",
  },
  {
    contactName: "Khách Hàng HCM",
    phone: "0987654321",
    detailAddress: "456 Lê Duẩn",
    type: AddressType.OFFICE,
    isDefault: false,
    provinceCode: 79,       // TP. Hồ Chí Minh
    provinceName: "Thành phố Hồ Chí Minh",
    wardCode: 26734,        // Phường Bến Nghé
    wardName: "Phường Bến Nghé",
  },
];