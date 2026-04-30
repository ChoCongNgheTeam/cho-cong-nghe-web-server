import { Request, Response } from "express";
import * as repo from "./audit.repository";
import { listAuditLogsSchema, listLoginHistorySchema } from "./audit.validation";

export const getAuditLogsHandler = async (req: Request, res: Response) => {
  const query = listAuditLogsSchema.parse(req.query);
  const result = await repo.findAuditLogs(query);
  res.json({
    data: result.data,
    pagination: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    message: "Lấy audit log thành công",
  });
};

export const getLoginHistoryHandler = async (req: Request, res: Response) => {
  const query = listLoginHistorySchema.parse(req.query);
  const result = await repo.findLoginHistory(query);
  res.json({
    data: result.data,
    pagination: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    message: "Lấy lịch sử đăng nhập thành công",
  });
};

export const getMyLoginHistoryHandler = async (req: Request, res: Response) => {
  const query = listLoginHistorySchema.parse(req.query);
  const result = await repo.findLoginHistory({ ...query, userId: req.user!.id });
  res.json({
    data: result.data,
    pagination: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages },
    message: "Lấy lịch sử đăng nhập thành công",
  });
};

/**
 * GET /audit/sessions
 *
 * Returns active sessions enriched with an `isCurrent` flag.
 *
 * The FE must send the current refresh_token's DB row ID in the
 * `x-token-id` request header so we can mark it as the current session.
 *
 * Why x-token-id instead of reading the cookie here?
 * The refresh token cookie value is available, but looking it up in the DB
 * on every session-list call adds an extra query. Instead the FE stores
 * the tokenId returned alongside the access token at login time (see below).
 *
 * Frontend responsibility:
 *   - On login response: store `tokenId` (the refresh_tokens.id) alongside the accessToken.
 *   - On this API call: send it as `headers["x-token-id"]`.
 *
 * If the header is absent we fall back to matching by the raw refresh-token
 * cookie value, which also works correctly.
 */
export const getActiveSessionsHandler = async (req: Request, res: Response) => {
  const sessions = await repo.findActiveSessions(req.user!.id);

  // Determine current session: prefer explicit tokenId header, fall back to cookie lookup
  const currentTokenId = req.headers["x-token-id"] as string | undefined;
  const currentRefreshToken = req.cookies?.refreshToken as string | undefined;

  // If we only have the raw token we need its id — fetch it once
  let resolvedCurrentId = currentTokenId;
  if (!resolvedCurrentId && currentRefreshToken) {
    const { default: prisma } = await import("@/config/db");
    const row = await prisma.refresh_tokens.findUnique({
      where: { token: currentRefreshToken },
      select: { id: true },
    });
    resolvedCurrentId = row?.id;
  }

  const data = sessions.map((s) => ({
    ...s,
    isCurrent: s.id === resolvedCurrentId,
  }));

  res.json({ data, message: "Lấy danh sách phiên đăng nhập thành công" });
};

export const revokeSessionHandler = async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === "ADMIN";
  const result = await repo.revokeSession(req.params.tokenId, req.user!.id, isAdmin);
  if (!result) return res.status(403).json({ message: "Không có quyền thu hồi phiên này" });
  res.json({ message: "Thu hồi phiên đăng nhập thành công" });
};

/**
 * DELETE /audit/sessions
 *
 * Revokes all sessions except the current one (identified by x-token-id header).
 * This is intentional — the user keeps their current session so they remain logged in
 * and can immediately change their password if their account was compromised.
 *
 * Security note: if an attacker calls this endpoint they can only kick others out,
 * not themselves. The legitimate user logs in again, sees one session (attacker's),
 * revokes it, and changes their password. This is the same flow Google/GitHub use.
 */
export const revokeAllSessionsHandler = async (req: Request, res: Response) => {
  const currentTokenId = req.headers["x-token-id"] as string | undefined;
  await repo.revokeAllSessions(req.user!.id, currentTokenId);
  res.json({ message: "Đã đăng xuất tất cả thiết bị khác" });
};

export const getAnomaliesHandler = async (_req: Request, res: Response) => {
  const bruteForce = await repo.findBruteForceAttempts();
  res.json({
    data: { bruteForce },
    message: "Lấy dữ liệu bất thường thành công",
  });
};
