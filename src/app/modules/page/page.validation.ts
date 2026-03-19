import { z } from "zod";
import { PageType, PolicyType } from "@prisma/client";

export const pageSlugParamsSchema = z.object({
  slug: z.string().min(1, "Slug không được để trống"),
});

export const listPagesQuerySchema = z.object({
  type: z.nativeEnum(PageType).optional(),
  policyType: z.nativeEnum(PolicyType).optional(),
});

// Validate params ID (UUID)
export const pageIdParamsSchema = z.object({
  id: z.string().uuid("ID không hợp lệ"),
});

// Validate Query List Admin (Có phân trang, tìm kiếm)
export const adminListPagesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  keyword: z.string().optional(),
  type: z.nativeEnum(PageType).optional(),
  isPublished: z.enum(["true", "false"]).optional().transform((val) => {
    if (val === undefined) return undefined;
    return val === "true";
  }),
});


// Validate Body Create
export const createPageSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  slug: z.string().min(1, "Slug không được để trống"),
  content: z.string().min(1, "Nội dung không được để trống"),
  type: z.nativeEnum(PageType),
  policyType: z.nativeEnum(PolicyType).nullable().optional(),
  isPublished: z.boolean().default(true),
  priority: z.number().int().default(0),
});

// Validate Body Update (Partial của Create)
export const updatePageSchema = createPageSchema.partial();

// BỔ SUNG: Validate Body cho API đổi trạng thái nhanh
export const changeStatusSchema = z.object({
  isPublished: z.boolean().describe("Trạng thái isPublished là bắt buộc"),
});

export type ChangeStatusInput = z.infer<typeof changeStatusSchema>;
export type CreatePageInput = z.infer<typeof createPageSchema>;
export type AdminListPagesQuery = z.infer<typeof adminListPagesQuerySchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
export type PageSlugParams = z.infer<typeof pageSlugParamsSchema>;
export type ListPagesQuery = z.infer<typeof listPagesQuerySchema>;