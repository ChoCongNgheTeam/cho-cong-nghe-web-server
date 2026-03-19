import { PageType, PolicyType } from "@prisma/client";

export interface PageSeedData {
  title: string;
  slug: string;
  type: PageType;
  policyType?: PolicyType | null;
  isPublished?: boolean;
  priority?: number;
  content: string;
}