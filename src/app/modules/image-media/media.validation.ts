import { z } from "zod";
import { MediaType, MediaPosition } from "./media.types";

export const mediaTypeSchema = z.nativeEnum(MediaType);
export const mediaPositionSchema = z.nativeEnum(MediaPosition);

export const createMediaSchema = z.object({
  type: mediaTypeSchema,
  position: mediaPositionSchema,
  title: z.string().trim().max(200, "Tiêu đề tối đa 200 ký tự").optional().or(z.literal("")),
  imagePath: z.string().optional().or(z.literal("")),
  imageUrl: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
  linkUrl: z.string().optional().or(z.literal("")),
  order: z.coerce.number().int().min(0, "Order phải >= 0").optional(),
  isActive: z.coerce.boolean().optional().default(true),
});

export const updateMediaSchema = z.object({
  type: mediaTypeSchema.optional(),
  position: mediaPositionSchema.optional(),
  title: z.string().trim().max(200, "Tiêu đề tối đa 200 ký tự").optional().or(z.literal("")),
  imagePath: z.string().optional().or(z.literal("")),
  imageUrl: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
  linkUrl: z.string().optional().or(z.literal("")),
  order: z.coerce.number().int().min(0, "Order phải >= 0").optional(),
  isActive: z.coerce.boolean().optional(),
});

export const reorderMediaSchema = z.object({
  mediaId: z.string().uuid("Media ID không hợp lệ"),
  newOrder: z.coerce.number().int().min(0, "Order phải >= 0"),
});

export const mediaParamsSchema = z.object({
  id: z.string().uuid({ message: "ID media không hợp lệ" }),
});

export const mediaTypeParamsSchema = z.object({
  type: mediaTypeSchema,
});

export const mediaPositionParamsSchema = z.object({
  position: mediaPositionSchema,
});

export const mediaFilterSchema = z.object({
  type: mediaTypeSchema,
  position: mediaPositionSchema,
});

export type CreateMediaInput = z.infer<typeof createMediaSchema>;
export type UpdateMediaInput = z.infer<typeof updateMediaSchema>;
export type ReorderMediaInput = z.infer<typeof reorderMediaSchema>;
export { MediaType, MediaPosition };
