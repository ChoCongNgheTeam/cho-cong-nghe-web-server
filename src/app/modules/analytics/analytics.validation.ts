import { z } from "zod";

export const dashboardQuerySchema = z.object({
  period: z.enum(["today", "week", "month", "year"]).optional().default("month"),
});

export const analyticsQuerySchema = z
  .object({
    from: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "from phải có định dạng YYYY-MM-DD")
      .transform((v) => new Date(v + "T00:00:00.000Z")),
    to: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "to phải có định dạng YYYY-MM-DD")
      .transform((v) => new Date(v + "T23:59:59.999Z")),
    granularity: z.enum(["day", "week", "month"]).optional().default("day"),
  })
  .refine((data) => data.from <= data.to, {
    message: "from không được lớn hơn to",
    path: ["from"],
  })
  .refine(
    (data) => {
      const diffMs = data.to.getTime() - data.from.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      return diffDays <= 366;
    },
    {
      message: "Khoảng thời gian tối đa là 366 ngày",
      path: ["to"],
    },
  );
