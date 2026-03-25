import type { SeedSpecificationGroupInput } from "./types";

export const galaxySSpecificationGroups: SeedSpecificationGroupInput[] = [
  {
    key: "thong-tin-hang-hoa",
    name: "Thông tin hàng hóa",
    icon: "package",
    sortOrder: 1,
    specifications: [{ key: "hello", name: "Hướng dẫn sử dụng/bảo quản", unit: null, icon: "book-open" }],
  },
];
