import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

type RequestPart = "body" | "query" | "params";

export const validate =
  <T>(schema: ZodSchema<T>, source: RequestPart = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source] ?? {});

    if (!result.success) {
      const errors: Record<string, string> = {};
      const { fieldErrors } = result.error.flatten((issue) => issue.message);

      for (const key in fieldErrors) {
        if (fieldErrors[key]?.length) {
          errors[key] = fieldErrors[key]![0];
        }
      }

      return res.status(400).json({
        message: "Invalid data",
        errors,
      });
    }

    if (source === "query" || source === "params") {
      Object.defineProperty(req, source, {
        value: result.data,
        writable: true,
        configurable: true,
      });
    } else {
      (req as any)[source] = result.data; // body vẫn ghi bình thường
    }

    next();
  };
