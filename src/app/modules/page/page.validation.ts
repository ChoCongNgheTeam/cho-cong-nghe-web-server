import { z } from "zod";

export const pageSlugParamsSchema = z.object({
  slug: z.string().min(1, "Slug không được để trống"),
});

export type PageSlugParams = z.infer<typeof pageSlugParamsSchema>;