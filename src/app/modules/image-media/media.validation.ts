import { z } from "zod";

// Enum values
export const MediaTypeEnum = z.enum(["SLIDER", "BANNER"]);
export const MediaPositionEnum = z.enum([
  "HOME_TOP",
  "BELOW_SLIDER",
  "HOME_SECTION_1",
  "HOME_SECTION_2",
]);

export const createMediaSchema = z.object({
  type: MediaTypeEnum,

  position: MediaPositionEnum,

  title: z.string().trim().max(200, "Tiêu đề tối đa 200 ký tự").optional().or(z.literal("")),

  imagePath: z.string("URL hình ảnh không hợp lệ").optional().or(z.literal("")),

  linkUrl: z.string("URL hình ảnh không hợp lệ").optional().or(z.literal("")),

  order: z.number().int().min(0, "Order phải >= 0").optional(),

  isActive: z.boolean().optional().default(true),
});

export const updateMediaSchema = z
  .object({
    type: MediaTypeEnum.optional(),

    position: MediaPositionEnum.optional(),

    title: z.string().trim().max(200, "Tiêu đề tối đa 200 ký tự").optional().or(z.literal("")),

    imagePath: z.string("URL hình ảnh không hợp lệ").optional().or(z.literal("")),

    linkUrl: z.string("URL hình ảnh không hợp lệ").optional().or(z.literal("")),

    order: z.number().int().min(0, "Order phải >= 0").optional(),

    isActive: z.boolean().optional(),
  })
  .strict();

export const reorderMediaSchema = z.object({
  mediaId: z.uuid("Media ID không hợp lệ"),
  newOrder: z.number().int().min(0, "Order phải >= 0"),
});

// Query validation
export const getMediaByTypeSchema = z.object({
  type: MediaTypeEnum,
});

export const getMediaByPositionSchema = z.object({
  position: MediaPositionEnum,
});

export const getMediaByTypeAndPositionSchema = z.object({
  type: MediaTypeEnum,
  position: MediaPositionEnum,
});

export type CreateMediaInput = z.infer<typeof createMediaSchema>;
export type UpdateMediaInput = z.infer<typeof updateMediaSchema>;
export type ReorderMediaInput = z.infer<typeof reorderMediaSchema>;
export type GetMediaByTypeInput = z.infer<typeof getMediaByTypeSchema>;
export type GetMediaByPositionInput = z.infer<typeof getMediaByPositionSchema>;
export type GetMediaByTypeAndPositionInput = z.infer<typeof getMediaByTypeAndPositionSchema>;
