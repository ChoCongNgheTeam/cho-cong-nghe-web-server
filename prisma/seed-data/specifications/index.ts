import { phoneSpecificationGroups } from "./phone";
// import { laptopSpecificationGroups } from "./laptop";

export const specificationGroupsByCategory = {
  "iphone-13-series": phoneSpecificationGroups, // dùng slug của category
  // "laptop": laptopSpecificationGroups,
} as const;
