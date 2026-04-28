import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { ListAuditLogsQuery, ListLoginHistoryQuery } from "./audit.validation";

export const findAuditLogs = async (query: ListAuditLogsQuery) => {
  const { page, limit, module, action, severity, isSuccess, userId, ip, from, to, search } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.audit_logsWhereInput = {
    ...(module && { module }),
    ...(action && { action: action as any }),
    ...(severity && { severity: severity as any }),
    ...(isSuccess !== undefined && { isSuccess }),
    ...(userId && { userId }),
    ...(ip && { ip: { contains: ip } }),
    ...(from || to ? { createdAt: { ...(from && { gte: new Date(from) }), ...(to && { lte: new Date(to) }) } } : {}),
    ...(search && { description: { contains: search, mode: "insensitive" as const } }),
  };

  const [data, total] = await prisma.$transaction([prisma.audit_logs.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }), prisma.audit_logs.count({ where })]);

  return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
};

export const findLoginHistory = async (query: ListLoginHistoryQuery & { selfOnly?: string }) => {
  const { page = 1, limit = 20, userId } = query;
  const skip = (page - 1) * limit;
  const where = userId ? { userId } : {};

  const [data, total] = await prisma.$transaction([prisma.login_history.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }), prisma.login_history.count({ where })]);

  return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
};

export const findActiveSessions = async (userId: string) => {
  return prisma.refresh_tokens.findMany({
    where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
};

export const revokeSession = async (tokenId: string, requesterId: string, isAdmin: boolean) => {
  const token = await prisma.refresh_tokens.findUnique({ where: { id: tokenId } });
  if (!token) return null;
  // Staff chỉ được revoke session của chính mình
  if (!isAdmin && token.userId !== requesterId) return null;
  return prisma.refresh_tokens.update({
    where: { id: tokenId },
    data: { revokedAt: new Date() },
  });
};

export const revokeAllSessions = async (userId: string, exceptTokenId?: string) => {
  return prisma.refresh_tokens.updateMany({
    where: {
      userId,
      revokedAt: null,
      ...(exceptTokenId && { id: { not: exceptTokenId } }),
    },
    data: { revokedAt: new Date() },
  });
};

// Anomaly: login fail > 5 lần trong 10 phút từ cùng IP
export const findBruteForceAttempts = async () => {
  const since = new Date(Date.now() - 10 * 60 * 1000);
  return prisma.login_history.groupBy({
    by: ["ip"],
    where: { isSuccess: false, createdAt: { gte: since }, ip: { not: null } },
    _count: { id: true },
    having: { id: { _count: { gt: 5 } } },
  });
};
