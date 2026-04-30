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

/**
 * Active sessions for the session management UI.
 *
 * Returns all non-revoked, non-expired refresh_token rows for a user.
 * Fields returned cover everything the FE ActiveSession type needs:
 *   id, deviceName, browser, ip, location, lastUsedAt, createdAt
 *
 * NOTE: lastUsedAt is stamped during token rotation (each /refresh call),
 * so it reflects the last time the client requested a new access token —
 * a reliable "last active" proxy for sessions that are still alive.
 */
export const findActiveSessions = async (userId: string) => {
  return prisma.refresh_tokens.findMany({
    where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      deviceName: true,
      browser: true,
      ip: true,
      location: true,
      lastUsedAt: true,
      createdAt: true,
      userAgent: true,
    },
  });
};

export const revokeSession = async (tokenId: string, requesterId: string, isAdmin: boolean) => {
  const token = await prisma.refresh_tokens.findUnique({ where: { id: tokenId } });
  if (!token) return null;
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

// Anomaly: > 5 failed logins from the same IP within 10 minutes
export const findBruteForceAttempts = async () => {
  const since = new Date(Date.now() - 10 * 60 * 1000);
  return prisma.login_history.groupBy({
    by: ["ip"],
    where: { isSuccess: false, createdAt: { gte: since }, ip: { not: null } },
    _count: { id: true },
    having: { id: { _count: { gt: 5 } } },
  });
};
