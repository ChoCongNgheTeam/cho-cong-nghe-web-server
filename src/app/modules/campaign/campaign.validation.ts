import { z } from "zod";
import { CampaignType } from "@prisma/client";

export const campaignParamsSchema = z.object({
  id: z.string().uuid("ID chiến dịch không hợp lệ"),
});

export const campaignSlugParamsSchema = z.object({
  slug: z.string().min(1, { message: "Slug không được để trống" }),
});

// ✅ FIX: schema riêng cho route chỉ có campaignId (không có categoryId)
export const campaignOnlyParamsSchema = z.object({
  campaignId: z.string().uuid({ message: "ID chiến dịch không hợp lệ" }),
});

export const listCampaignsQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
  search: z.string().optional(),
  type: z.nativeEnum(CampaignType).optional(),
  isActive: z.coerce.boolean().optional(),
  status: z.enum(["active", "inactive", "upcoming", "expired"]).optional(),
  sortBy: z.enum(["name", "createdAt", "startDate", "endDate"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  includeDeleted: z.coerce.boolean().optional().default(false),
});

export const activeCampaignsQuerySchema = z.object({
  type: z.nativeEnum(CampaignType).optional(),
});

export const createCampaignSchema = z.object({
  name: z.string().trim().min(2, "Tên chiến dịch phải từ 2 ký tự").max(200, "Tên chiến dịch tối đa 200 ký tự"),
  type: z.nativeEnum(CampaignType, { message: "Loại chiến dịch không hợp lệ" }),
  description: z.string().trim().max(1000, "Mô tả tối đa 1000 ký tự").optional().or(z.literal("")),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  isActive: z.coerce.boolean().optional().default(true),
});

export const updateCampaignSchema = z.object({
  name: z.string().trim().min(2, "Tên chiến dịch phải từ 2 ký tự").max(200, "Tên chiến dịch tối đa 200 ký tự").optional(),
  type: z.nativeEnum(CampaignType).optional(),
  description: z.string().trim().max(1000, "Mô tả tối đa 1000 ký tự").optional().or(z.literal("")),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  isActive: z.coerce.boolean().optional(),
});

export const campaignCategorySchema = z.object({
  categoryId: z.string().uuid({ message: "ID danh mục không hợp lệ" }),
  position: z.coerce.number().int().min(0, "Vị trí phải >= 0"),
  title: z.string().trim().max(200, "Tiêu đề tối đa 200 ký tự").optional().or(z.literal("")),
  description: z.string().trim().max(500, "Mô tả tối đa 500 ký tự").optional().or(z.literal("")),
  imagePath: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

export const addCampaignCategorySchema = z.object({
  categories: z.array(campaignCategorySchema).min(1, "Phải có ít nhất 1 danh mục"),
});

export const updateCampaignCategorySchema = z.object({
  position: z.coerce.number().int().min(0, "Vị trí phải >= 0").optional(),
  title: z.string().trim().max(200, "Tiêu đề tối đa 200 ký tự").optional().or(z.literal("")),
  description: z.string().trim().max(500, "Mô tả tối đa 500 ký tự").optional().or(z.literal("")),
  imagePath: z.string().optional(),
  imageUrl: z.string().url().optional(),
  removeImage: z.boolean().optional(),
});

export const campaignCategoryParamsSchema = z.object({
  campaignId: z.string().uuid({ message: "ID chiến dịch không hợp lệ" }),
  categoryId: z.string().uuid({ message: "ID danh mục không hợp lệ" }),
});

export const bulkDeleteCampaignsSchema = z.object({
  ids: z.array(z.string().uuid("ID không hợp lệ")).min(1, "Phải chọn ít nhất 1 chiến dịch"),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type ListCampaignsQuery = z.infer<typeof listCampaignsQuerySchema>;
export type CampaignCategoryInput = z.infer<typeof campaignCategorySchema>;
export type AddCampaignCategoryInput = z.infer<typeof addCampaignCategorySchema>;
export type UpdateCampaignCategoryInput = z.infer<typeof updateCampaignCategorySchema>;
export type BulkDeleteCampaignsInput = z.infer<typeof bulkDeleteCampaignsSchema>;