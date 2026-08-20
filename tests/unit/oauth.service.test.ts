import { describe, it, expect, vi, beforeEach } from "vitest";
import { UnauthorizedError } from "@/errors";

const findOAuthAccountMock = vi.fn();
const createOAuthAccountMock = vi.fn();
const findByEmailMock = vi.fn();
const createUserFromOAuthMock = vi.fn();
const createRefreshTokenMock = vi.fn();

vi.mock("@/app/modules/auth/auth.repository", () => ({
  findOAuthAccount: (...a: any[]) => findOAuthAccountMock(...a),
  createOAuthAccount: (...a: any[]) => createOAuthAccountMock(...a),
  findByEmail: (...a: any[]) => findByEmailMock(...a),
  createUserFromOAuth: (...a: any[]) => createUserFromOAuthMock(...a),
  createRefreshToken: (...a: any[]) => createRefreshTokenMock(...a),
}));

vi.mock("@/config/db", () => ({
  default: {
    vouchers: { create: vi.fn().mockResolvedValue({ id: "v1", code: "WELCOME_TEST" }) },
    voucher_user: { create: vi.fn() },
  },
}));

vi.mock("@/app/modules/notification/notification.service", () => ({
  sendWelcomeVoucherNotification: vi.fn(),
}));

// verifyIdToken của google-auth-library — mock để kiểm soát payload trả về
const verifyIdTokenMock = vi.fn();
vi.mock("google-auth-library", () => {
  class FakeOAuth2Client {
    verifyIdToken(...a: any[]) {
      return verifyIdTokenMock(...a);
    }
  }
  return { OAuth2Client: FakeOAuth2Client };
});

import { findOrCreateOAuthUser, loginWithGoogle } from "@/app/modules/auth/oauth/oauth.service";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("oauth.service — findOrCreateOAuthUser", () => {
  const baseProfile = {
    providerAccountId: "google-sub-123",
    email: "user@example.com",
    fullName: "Nguyen Van A",
    avatarImage: null,
  };

  it("đã có oauth_account liên kết sẵn -> đăng nhập thẳng, KHÔNG tạo user/link mới", async () => {
    findOAuthAccountMock.mockResolvedValue({
      user: { id: "user-1", email: "user@example.com", userName: "u1", fullName: "A", role: "CUSTOMER", isActive: true },
    });
    createRefreshTokenMock.mockResolvedValue({});

    const result = await findOrCreateOAuthUser("google", baseProfile);

    expect(result.user.id).toBe("user-1");
    expect(result.accessToken).toBeTruthy();
    expect(createUserFromOAuthMock).not.toHaveBeenCalled();
    expect(createOAuthAccountMock).not.toHaveBeenCalled();
  });

  it("chưa có oauth_account nhưng đã có user cùng email -> LIÊN KẾT tài khoản (tạo oauth_account), không tạo user mới", async () => {
    findOAuthAccountMock.mockResolvedValue(null);
    findByEmailMock.mockResolvedValue({ id: "existing-user-1", email: "user@example.com", userName: "u1", fullName: "A", role: "CUSTOMER", isActive: true });
    createOAuthAccountMock.mockResolvedValue({});
    createRefreshTokenMock.mockResolvedValue({});

    const result = await findOrCreateOAuthUser("google", baseProfile);

    expect(result.user.id).toBe("existing-user-1");
    expect(createUserFromOAuthMock).not.toHaveBeenCalled(); // KHÔNG tạo user trùng
    expect(createOAuthAccountMock).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "existing-user-1", provider: "google", providerAccountId: "google-sub-123" }),
    );
  });

  it("hoàn toàn mới -> tạo user mới + link oauth_account", async () => {
    findOAuthAccountMock.mockResolvedValue(null);
    findByEmailMock.mockResolvedValue(null);
    createUserFromOAuthMock.mockResolvedValue({ id: "new-user-1", email: "user@example.com", userName: "u1_ab12", fullName: "A", role: "CUSTOMER", isActive: true });
    createOAuthAccountMock.mockResolvedValue({});
    createRefreshTokenMock.mockResolvedValue({});

    const result = await findOrCreateOAuthUser("google", baseProfile);

    expect(result.user.id).toBe("new-user-1");
    expect(createUserFromOAuthMock).toHaveBeenCalledTimes(1);
    expect(createOAuthAccountMock).toHaveBeenCalledWith(expect.objectContaining({ userId: "new-user-1" }));
  });

  it("từ chối đăng nhập nếu tài khoản đã bị vô hiệu hóa (isActive=false)", async () => {
    findOAuthAccountMock.mockResolvedValue({
      user: { id: "user-1", email: "user@example.com", userName: "u1", fullName: "A", role: "CUSTOMER", isActive: false },
    });

    await expect(findOrCreateOAuthUser("google", baseProfile)).rejects.toBeInstanceOf(UnauthorizedError);
    expect(createRefreshTokenMock).not.toHaveBeenCalled();
  });
});

describe("oauth.service — loginWithGoogle", () => {
  it("từ chối khi Google verifyIdToken throw (token giả/hết hạn)", async () => {
    verifyIdTokenMock.mockRejectedValue(new Error("invalid signature"));

    await expect(loginWithGoogle("fake-token")).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("từ chối khi payload thiếu email hoặc sub (không đủ thông tin định danh)", async () => {
    verifyIdTokenMock.mockResolvedValue({ getPayload: () => ({ sub: "abc" /* thiếu email */ }) });

    await expect(loginWithGoogle("token-without-email")).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("đăng nhập thành công: map đúng payload Google -> profile -> findOrCreateOAuthUser", async () => {
    verifyIdTokenMock.mockResolvedValue({
      getPayload: () => ({ sub: "google-sub-999", email: "newgoogleuser@example.com", name: "Google User", picture: "https://avatar.url/pic.png" }),
    });
    findOAuthAccountMock.mockResolvedValue(null);
    findByEmailMock.mockResolvedValue(null);
    createUserFromOAuthMock.mockResolvedValue({
      id: "user-google-1",
      email: "newgoogleuser@example.com",
      userName: "newgoogleuser_ab12",
      fullName: "Google User",
      role: "CUSTOMER",
      isActive: true,
    });
    createOAuthAccountMock.mockResolvedValue({});
    createRefreshTokenMock.mockResolvedValue({});

    const result = await loginWithGoogle("valid-token");

    expect(result.user.email).toBe("newgoogleuser@example.com");
    expect(createOAuthAccountMock).toHaveBeenCalledWith(expect.objectContaining({ provider: "google", providerAccountId: "google-sub-999" }));
  });
});
