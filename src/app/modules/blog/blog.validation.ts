import { z } from "zod";
import { BlogStatus } from "./blog.types";

export const listBlogsSchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(50).default(12),
  search: z.string().optional(),
  status: z.enum(Object.values(BlogStatus) as [BlogStatus, ...BlogStatus[]]).optional(),
  authorId: z.uuid().optional(),
  sortBy: z.enum(["createdAt", "publishedAt", "viewCount", "title"]).default("publishedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const blogParamsSchema = z.object({
  id: z.uuid({ message: "ID blog không hợp lệ" }),
});

export const blogBySlugParamsSchema = z.object({
  slug: z.string().min(1, { message: "Slug không được để trống" }),
});

export const createBlogSchema = z.object({
  title: z
    .string()
    .min(10, "Tiêu đề phải có ít nhất 10 ký tự")
    .max(200, "Tiêu đề tối đa 200 ký tự"),
  content: z.string().min(100, "Nội dung phải có ít nhất 100 ký tự"),
  imageUrl: z.string().url().optional(),
  imagePath: z.string().optional(),
  status: z
    .enum(Object.values(BlogStatus) as [BlogStatus, ...BlogStatus[]])
    .default(BlogStatus.DRAFT),
  publishedAt: z.coerce.date().optional(),
});

export const updateBlogSchema = z.object({
  title: z.string().min(10).max(200).optional(),
  content: z.string().min(100).optional(),
  imageUrl: z.string().url().optional(),
  imagePath: z.string().optional(),
  status: z.enum(Object.values(BlogStatus) as [BlogStatus, ...BlogStatus[]]).optional(),
  publishedAt: z.coerce.date().optional(),
});

export type ListBlogsQuery = z.infer<typeof listBlogsSchema>;
export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
export { BlogStatus };
