import { z } from "zod";

export const listAuditLogsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  module: z.string().optional(),
  action: z.string().optional(),
  severity: z.enum(["INFO", "WARNING", "CRITICAL"]).optional(),
  isSuccess: z.coerce.boolean().optional(),
  userId: z.string().uuid().optional(),
  ip: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  search: z.string().optional(),
});

export const listLoginHistorySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  userId: z.string().uuid().optional(),
});

export type ListAuditLogsQuery = z.infer<typeof listAuditLogsSchema>;
export type ListLoginHistoryQuery = z.infer<typeof listLoginHistorySchema>;
