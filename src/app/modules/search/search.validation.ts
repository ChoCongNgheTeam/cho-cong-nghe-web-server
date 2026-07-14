import { z } from "zod";

export const searchQuerySchema = z.object({
  q: z.string().trim().max(100, "Từ khóa tìm kiếm quá dài").optional().default(""),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(48).default(12),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
