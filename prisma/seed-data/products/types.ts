export interface SeedProductInput {
  name: string;
  slug: string;
  description: string;
  brandName: string;
  categoryNames: string[];
  isFeatured?: boolean;
  variantDisplay?: "CARD" | "SELECTOR";
  highlights?: Array<{ key: string }>;
}
