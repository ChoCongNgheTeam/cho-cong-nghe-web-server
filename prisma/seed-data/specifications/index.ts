import { phoneSpecificationGroups } from "./phone";
// import { laptopSpecificationGroups } from "./laptop";

export const specificationGroupsByCategory = {
  "dien-thoai": phoneSpecificationGroups, // dùng slug của category
  // "laptop": laptopSpecificationGroups,
} as const;
