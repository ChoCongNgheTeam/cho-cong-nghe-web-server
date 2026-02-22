import { Request, Response, NextFunction } from "express";

type FieldType = "json" | "boolean" | "number" | "date";

interface ParseOptions {
  fields?: Record<string, FieldType>;
  autoParseJSON?: boolean;
  strict?: boolean;
}

/**
 * Middleware to parse multipart form-data fields
 *
 * Usage:
 * ```typescript
 * router.post('/upload',
 *   upload.array('images'),
 *   parseMultipart({
 *     fields: {
 *       categories: 'json',
 *       isActive: 'boolean',
 *       position: 'number',
 *       startDate: 'date'
 *     }
 *   }),
 *   handler
 * );
 * ```
 */
export function parseMultipart(options?: ParseOptions) {
  const { fields = {}, autoParseJSON = true, strict = false } = options || {};

  return function (req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.body) return next();

      for (const key in req.body) {
        let value: any = req.body[key];

        if (typeof value !== "string") continue;

        const type = fields[key];

        try {
          switch (type) {
            case "boolean":
              req.body[key] = value === "true";
              continue;

            case "number":
              const num = Number(value);
              if (isNaN(num)) throw new Error("Invalid number");
              req.body[key] = num;
              continue;

            case "date":
              const date = new Date(value);
              if (isNaN(date.getTime())) throw new Error("Invalid date");
              req.body[key] = date;
              continue;

            case "json":
              const parsed = JSON.parse(value);

              // Auto unwrap if key matches field name
              if (parsed && typeof parsed === "object" && key in parsed && Object.keys(parsed).length === 1) {
                req.body[key] = parsed[key];
              } else {
                req.body[key] = parsed;
              }
              continue;
          }

          // Auto parse JSON if type not specified
          if (autoParseJSON) {
            req.body[key] = JSON.parse(value);
          }
        } catch (err) {
          if (strict) {
            return res.status(400).json({
              success: false,
              message: `Invalid value for field "${key}"`,
            });
          }
          // If not strict, keep original string value
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
