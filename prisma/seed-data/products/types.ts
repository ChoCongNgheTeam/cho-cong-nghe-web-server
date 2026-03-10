export interface SeedProductInput {
  name: string;
  slug: string;
  description: string;
  brandName: string;
  categoryNames: string[];
  isFeatured?: boolean;
  highlights?: Array<{ key: string }>;
}
