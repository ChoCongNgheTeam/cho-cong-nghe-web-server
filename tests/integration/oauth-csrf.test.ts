import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";

vi.mock("@/config/db", () => ({
  default: {
    users: { findUnique: vi.fn(), findFirst: vi.fn() },
    oauth_accounts: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
    vouchers: { create: vi.fn() },
    voucher_user: { create: vi.fn() },
  },
}));

vi.mock("@/app/modules/auth/auth.repository", () => ({
  createRefreshToken: vi.fn().mockResolvedValue({}),
  findOAuthAccount: vi.fn(),
  createOAuthAccount: vi.fn(),
  findByEmail: vi.fn(),
  createUserFromOAuth: vi.fn(),
}));

vi.mock("@/app/modules/notification/notification.service", () => ({
  sendWelcomeVoucherNotification: vi.fn(),
}));

// exchangeFacebookCode gọi API thật của Facebook (network) — mock hẳn để test
// tập trung vào phần chúng ta sửa: verify nonce CSRF ở callback, KHÔNG test
// lại tích hợp Facebook API (đã ngoài phạm vi lỗi bảo mật đã fix).
vi.mock("@/app/modules/auth/oauth/oauth.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/app/modules/auth/oauth/oauth.service")>();
  return {
    ...actual,
    exchangeFacebookCode: vi.fn().mockResolvedValue({
      accessToken: "fake-access-token",
      refreshToken: "fake-refresh-token",
      refreshTokenTTL: 86400000,
    }),
  };
});

import authRoute from "@/app/modules/auth/auth.route";
import { errorMiddleware } from "@/app/middlewares/error.middleware";

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/auth", authRoute);
  app.use(errorMiddleware);
  return app;
}

describe("OAuth Facebook — CSRF nonce protection (integration)", () => {
  const app = buildApp();

  beforeEach(() => {
    process.env.API_BASE_URL = "http://localhost:5000";
    process.env.FB_APP_ID = "test-fb-app-id";
    process.env.FRONTEND_URL = "http://localhost:3000";
  });

  it("/oauth/facebook/init đặt cookie nonce và redirect sang Facebook kèm state chứa nonce", async () => {
    const res = await request(app).get("/auth/oauth/facebook/init?returnUrl=/account");

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("facebook.com");

    const setCookie = res.headers["set-cookie"];
    expect(setCookie).toBeDefined();
    const nonceCookie = (setCookie as unknown as string[]).find((c: string) => c.startsWith("oauth_fb_state="));
    expect(nonceCookie).toBeDefined();

    // state param trong URL redirect phải chứa cùng nonce vừa set vào cookie
    const location = new URL(res.headers.location);
    const state = location.searchParams.get("state");
    const nonceInCookie = nonceCookie!.split(";")[0].split("=")[1];
    expect(state).toContain(nonceInCookie);
  });

  it("/oauth/facebook/callback TỪ CHỐI khi thiếu cookie nonce (kịch bản CSRF: attacker tự tạo state)", async () => {
    // Kẻ tấn công tự thực hiện flow OAuth (được state của attacker), rồi dụ nạn
    // nhân mở link callback này — nạn nhân KHÔNG có cookie oauth_fb_state hợp lệ
    // (vì họ chưa từng gọi /init), nên phải bị từ chối, không được login tự động.
    const res = await request(app).get("/auth/oauth/facebook/callback?code=attacker-code&state=attacker-nonce.%2Faccount");

    // Bị từ chối -> redirect về trang account thường (không set refresh token cookie thành công)
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("http://localhost:3000/account");
    const setCookie = (res.headers["set-cookie"] as unknown as string[]) || [];
    const hasRefreshCookie = setCookie.some((c) => c.startsWith("refreshToken="));
    expect(hasRefreshCookie).toBe(false);
  });

  it("/oauth/facebook/callback TỪ CHỐI khi state nonce KHÔNG khớp cookie nonce", async () => {
    const agent = request.agent(app);

    const initRes = await agent.get("/auth/oauth/facebook/init?returnUrl=/account");
    const location = new URL(initRes.headers.location);
    const realNonce = location.searchParams.get("state")!.split(".")[0];
    expect(realNonce).toBeTruthy();

    // Callback với state có nonce KHÁC nonce thật trong cookie (giả lập attacker
    // chèn state của chính họ trong khi nạn nhân vẫn có cookie nonce hợp lệ của
    // request /init trước đó).
    const res = await agent.get(`/auth/oauth/facebook/callback?code=some-code&state=wrong-nonce-value.%2Faccount`);

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("http://localhost:3000/account");
  });

  it("/oauth/facebook/callback THÀNH CÔNG khi state nonce khớp đúng cookie nonce (flow hợp lệ)", async () => {
    const agent = request.agent(app);

    const initRes = await agent.get("/auth/oauth/facebook/init?returnUrl=/dashboard");
    const location = new URL(initRes.headers.location);
    const state = location.searchParams.get("state")!;

    const res = await agent.get(`/auth/oauth/facebook/callback?code=valid-code&state=${encodeURIComponent(state)}`);

    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("/account/callback");
    expect(res.headers.location).toContain("returnUrl");

    const setCookie = (res.headers["set-cookie"] as unknown as string[]) || [];
    const hasRefreshCookie = setCookie.some((c) => c.startsWith("refreshToken="));
    expect(hasRefreshCookie).toBe(true);
  });

  it("/oauth/facebook/callback không cho open-redirect qua returnUrl (chỉ chấp nhận path nội bộ)", async () => {
    const agent = request.agent(app);

    const initRes = await agent.get("/auth/oauth/facebook/init?returnUrl=https://evil.com/phish");
    const location = new URL(initRes.headers.location);
    const state = location.searchParams.get("state")!;
    // returnUrl không an toàn phải bị thay bằng "/" ngay từ bước /init
    expect(decodeURIComponent(state.split(".").slice(1).join("."))).toBe("/");

    const res = await agent.get(`/auth/oauth/facebook/callback?code=valid-code&state=${encodeURIComponent(state)}`);
    expect(res.headers.location).toContain("returnUrl=%2F");
    expect(res.headers.location).not.toContain("evil.com");
  });
});
