import { z } from "zod";

export const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1, "Cần ít nhất 1 tin nhắn")
    .max(50, "Tối đa 50 tin nhắn"),
});

export type ChatInput = z.infer<typeof chatSchema>;
