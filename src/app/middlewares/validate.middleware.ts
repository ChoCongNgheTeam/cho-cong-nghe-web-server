import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

type RequestPart = "body" | "query" | "params";

export const validate =
  (schema: ZodSchema, source: RequestPart = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const dataToValidate = req[source];
    const result = schema.safeParse(dataToValidate);

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

    // --- PHẦN SỬA LỖI BẮT ĐẦU TẠI ĐÂY ---
    // Nếu source là query, dùng defineProperty để tránh lỗi getter-only
    if (source === "query") {
      Object.defineProperty(req, "query", {
        value: result.data,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    } else {
      // Body và Params thường gán bình thường được
      req[source] = result.data;
    }
    // --- KẾT THÚC PHẦN SỬA LỖI ---

    next();
  };