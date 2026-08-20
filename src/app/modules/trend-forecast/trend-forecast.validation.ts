import { z } from "zod";

// "days" đi thẳng vào 1 khoảng thời gian trong raw SQL (INTERVAL) ở service,
// nên phải validate chặt ngay tại route: số nguyên dương, giới hạn tối đa 365
// để tránh cả injection lẫn query quét quá nhiều dữ liệu.
export const generateForecastSchema = z.object({
  days: z.coerce.number().int().min(1, "days phải >= 1").max(365, "days tối đa 365").default(7).optional(),
});
