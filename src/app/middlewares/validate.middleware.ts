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

    // store validated data safely
    (req as any)[`validated${capitalize(source)}`] = result.data;

    next();
  };

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
