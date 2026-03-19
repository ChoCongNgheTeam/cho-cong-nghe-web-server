import { z } from "zod";

export const uploadBodySchema = z.object({
  folder: z.enum(["products", "avatars", "banners", "blogs", "documents"]).default("products"),
});
