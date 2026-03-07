import { z } from "zod";
import { CommentTargetType } from "./comment.types";

export const listCommentsSchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(20),
  targetType: z.nativeEnum(CommentTargetType).optional(),
  targetId: z.string().uuid().optional(),
  isApproved: z.coerce.boolean().optional(),
  parentId: z
    .union([z.string().uuid(), z.literal("null")])
    .transform((val) => (val === "null" ? null : val))
    .optional(),
  sortBy: z.enum(["createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const commentParamsSchema = z.object({
  id: z.string().uuid({ message: "ID comment không hợp lệ" }),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, "Nội dung không được để trống").max(1000, "Nội dung tối đa 1000 ký tự"),
  targetType: z.nativeEnum(CommentTargetType),
  targetId: z.string().uuid("Target ID không hợp lệ"),
  parentId: z.string().uuid("Parent ID không hợp lệ").optional(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(1000).optional(),
  isApproved: z.boolean().optional(),
});

export const approveCommentSchema = z.object({
  isApproved: z.boolean(),
});

export const bulkApproveSchema = z.object({
  commentIds: z.array(z.string().uuid()).min(1, "Cần ít nhất 1 comment ID"),
  isApproved: z.boolean(),
});

export type ListCommentsQuery = z.infer<typeof listCommentsSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export { CommentTargetType };
