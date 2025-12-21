import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const flattened = result.error.flatten((issue) => issue.message);

      // Chỉ lấy fieldErrors và chuyển array thành string (lấy lỗi đầu tiên)
      const errors: Record<string, string> = {};
      Object.entries(flattened.fieldErrors).forEach(([key, messages]) => {
        if (Array.isArray(messages) && messages.length > 0) {
          errors[key] = messages[0];
        }
      });

      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        errors,
      });
    }

    req.body = result.data;
    next();
  };
