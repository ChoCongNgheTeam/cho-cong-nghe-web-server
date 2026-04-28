import prisma from "@/config/db";
import { Request } from "express";
import { AuditAction, AuditSeverity } from "@prisma/client";

export { AuditAction, AuditSeverity };

interface AuditLogInput {
  userId?: string;
  userName?: string;
  userRole?: string;
  action: AuditAction;
  module: string;
  targetId?: string;
  targetType?: string;
  description: string;
  diff?: { before?: unknown; after?: unknown };
  severity?: AuditSeverity;
  isSuccess?: boolean;
  errorMsg?: string;
  req?: Request;
}

export const auditLog = (input: AuditLogInput): void => {
  // fire-and-forget — không block response
  setImmediate(async () => {
    try {
      const ip = input.req ? extractIp(input.req) : undefined;
      const userAgent = input.req?.headers["user-agent"] ?? undefined;

      await prisma.audit_logs.create({
        data: {
          userId: input.userId,
          userName: input.userName,
          userRole: input.userRole,
          action: input.action,
          module: input.module,
          targetId: input.targetId,
          targetType: input.targetType,
          description: input.description,
          diff: input.diff ?? undefined,
          ip,
          userAgent,
          severity: input.severity ?? AuditSeverity.INFO,
          isSuccess: input.isSuccess ?? true,
          errorMsg: input.errorMsg,
        },
      });
    } catch (err) {
      // Không để audit fail ảnh hưởng app
      console.error("[AuditLog] Failed to write:", err);
    }
  });
};

export const auditLoginHistory = (data: { userId?: string; email?: string; isSuccess: boolean; ip?: string; userAgent?: string; location?: string; failReason?: string }): void => {
  setImmediate(async () => {
    try {
      await prisma.login_history.create({ data });
    } catch (err) {
      console.error("[AuditLog] Failed to write login_history:", err);
    }
  });
};

const extractIp = (req: Request): string => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress ?? "unknown";
};
