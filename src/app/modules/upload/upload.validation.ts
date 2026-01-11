import { z } from "zod";

export const uploadBodySchema = z.object({
  folder: z.enum(["products", "avatars", "banners", "documents"]).default("products"),
});