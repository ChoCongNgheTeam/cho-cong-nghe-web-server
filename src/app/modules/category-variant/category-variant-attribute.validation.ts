import { z } from "zod";

export const setCategoryAttributesSchema = z.object({
  attributeIds: z.array(z.string().uuid("attributeId không hợp lệ")),
});
