import { z } from "zod";

export const dashboardQuerySchema = z.object({
  period: z.enum(["today", "week", "month", "year"]).optional().default("month"),
});

export const analyticsQuerySchema = z
  .object({
    // Hỗ trợ cả period (shortcut) lẫn from/to (custom range)
    period: z.enum(["today", "week", "month", "year"]).optional(),
    from: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "from phải có định dạng YYYY-MM-DD")
      .optional(),
    to: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "to phải có định dạng YYYY-MM-DD")
      .optional(),
    granularity: z.enum(["hour", "day", "week", "month"]).optional(),
  })
  // Phải có period HOẶC (from + to)
  .refine((data) => data.period || (data.from && data.to), {
    message: "Cần truyền period hoặc cặp from + to",
    path: ["period"],
  })
  .transform((data) => {
    // Resolve from/to từ period nếu không có custom range
    let from: Date;
    let to: Date;

    if (data.from && data.to) {
      from = new Date(data.from + "T00:00:00.000Z");
      to = new Date(data.to + "T23:59:59.999Z");
    } else {
      // resolvePeriodRange được gọi ở service, ở đây chỉ pass qua
      // Trả về raw để service xử lý
      return { ...data, _resolvedFrom: null, _resolvedTo: null };
    }

    // Validate range tối đa 366 ngày
    const diffDays = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 366) throw new Error("Khoảng thời gian tối đa là 366 ngày");

    // Auto-detect granularity nếu FE không truyền
    const granularity =
      data.granularity ??
      (() => {
        if (diffDays <= 1) return "hour" as const;
        if (diffDays <= 90) return "day" as const;
        if (diffDays <= 180) return "week" as const;
        return "month" as const;
      })();

    return { ...data, granularity, _resolvedFrom: from, _resolvedTo: to };
  });
