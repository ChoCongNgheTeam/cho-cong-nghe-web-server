import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock toàn bộ tầng repository + side-effects (email, audit, notification) ──
// Mục tiêu: test LOGIC nghiệp vụ trong auth.service.ts (không đụng DB thật).
vi.mock("@/app/modules/auth/auth.repository", () => ({
  findByEmailOrUserName: vi.fn(),
  findByUserName: vi.fn(),
  findByEmail: vi.fn(),
  createUser: vi.fn(),
  updatePassword: vi.fn(),
  createPasswordResetToken: vi.fn(),
  findPasswordResetToken: vi.fn(),
  deletePasswordResetToken: vi.fn(),
  deleteRefreshToken: vi.fn(),
  createRefreshToken: vi.fn(),
  revokeAllRefreshTokensByUser: vi.fn(),
  revokeRefreshTokenById: vi.fn(),
  findValidRefreshTokenWithUser: vi.fn(),
  touchRefreshTokenLastUsed: vi.fn(),
  cleanupRevokedExpiredRefreshTokens: vi.fn(),
  setVerificationToken: vi.fn(),
  findByVerificationToken: vi.fn(),
  markUserVerified: vi.fn(),
  isKnownDevice: vi.fn().mockResolvedValue(true), // tránh side-effect gửi email "new device" trong hầu hết test
}));

vi.mock("@/integrations/email.service", () => ({
  sendResetPasswordEmail: vi.fn().mockResolvedValue(undefined),
  sendVerificationEmail: vi.fn().mockResolvedValue(undefined),
  sendNewDeviceLoginAlert: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/app/modules/notification/notification.service", () => ({
  sendWelcomeVoucherNotification: vi.fn(),
}));

vi.mock("@/app/modules/audit/audit.logger", () => ({
  auditLoginHistory: vi.fn(),
}));

vi.mock("@/app/modules/staff-permissions/staff-permissions.service", () => ({
  getPermissionsForAuth: vi.fn(),
}));

vi.mock("@/config/db", () => ({
  default: {
    vouchers: { create: vi.fn().mockResolvedValue({ id: "voucher-1", code: "WELCOME100K" }) },
    voucher_user: { create: vi.fn() },
    users: { findUnique: vi.fn() },
  },
}));

import * as repo from "@/app/modules/auth/auth.repository";
import { register, login, refreshTokenRotation, forgotPassword, resetPassword } from "@/app/modules/auth/auth.service";
import { DuplicateError, UnauthorizedError, BadRequestError } from "@/errors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { jwtConfig } from "@/config/jwt";

const mockedRepo = repo as unknown as Record<string, ReturnType<typeof vi.fn>>;

beforeEach(() => {
  vi.clearAllMocks();
  (mockedRepo.isKnownDevice as any).mockResolvedValue(true);
});

describe("auth.service — register", () => {
  it("báo lỗi trùng email khi email đã tồn tại", async () => {
    (mockedRepo.findByEmailOrUserName as any).mockResolvedValue({
      email: "existing@example.com",
      userName: "someone",
    });

    await expect(
      register({
        email: "existing@example.com",
        userName: "newuser",
        password: "Abc12345",
        fullName: "Nguyen Van A",
        phone: "0912345678",
      } as any),
    ).rejects.toBeInstanceOf(DuplicateError);
  });

  it("báo lỗi trùng username khi username đã tồn tại", async () => {
    (mockedRepo.findByEmailOrUserName as any).mockResolvedValue({
      email: "other@example.com",
      userName: "takenname",
    });

    await expect(
      register({
        email: "new@example.com",
        userName: "takenname",
        password: "Abc12345",
        fullName: "Nguyen Van A",
        phone: "0912345678",
      } as any),
    ).rejects.toBeInstanceOf(DuplicateError);
  });

  it("hash mật khẩu trước khi lưu, không bao giờ lưu plaintext", async () => {
    (mockedRepo.findByEmailOrUserName as any).mockResolvedValue(null);
    (mockedRepo.createUser as any).mockImplementation(async (data: any) => ({
      id: "user-1",
      email: data.email,
      userName: data.userName,
      fullName: data.fullName,
      role: data.role,
      createdAt: new Date(),
    }));

    await register({
      email: "New@Example.com",
      userName: "newuser",
      password: "PlainText123",
      fullName: "Nguyen Van A",
      phone: "0912345678",
    } as any);

    const createdData = (mockedRepo.createUser as any).mock.calls[0][0];
    expect(createdData.passwordHash).not.toBe("PlainText123");
    expect(await bcrypt.compare("PlainText123", createdData.passwordHash)).toBe(true);
    // Email luôn được chuẩn hoá về chữ thường để tránh tạo 2 tài khoản khác nhau
    // chỉ khác nhau ở hoa/thường (VD: New@Example.com vs new@example.com).
    expect(createdData.email).toBe("new@example.com");
  });
});

describe("auth.service — login", () => {
  it("từ chối khi user không tồn tại (thông báo generic, không lộ email tồn tại hay không)", async () => {
    (mockedRepo.findByUserName as any).mockResolvedValue(null);

    await expect(login({ userName: "ghost", password: "Abc12345" } as any)).rejects.toThrow(UnauthorizedError);
  });

  it("từ chối khi sai mật khẩu", async () => {
    const passwordHash = await bcrypt.hash("CorrectPass1", 10);
    (mockedRepo.findByUserName as any).mockResolvedValue({
      id: "user-1",
      email: "u@example.com",
      userName: "u1",
      role: "CUSTOMER",
      isActive: true,
      isVerified: true,
      passwordHash,
    });

    await expect(login({ userName: "u1", password: "WrongPass1" } as any)).rejects.toThrow(UnauthorizedError);
  });

  it("từ chối khi tài khoản chưa xác thực email", async () => {
    const passwordHash = await bcrypt.hash("CorrectPass1", 10);
    (mockedRepo.findByUserName as any).mockResolvedValue({
      id: "user-1",
      email: "u@example.com",
      userName: "u1",
      role: "CUSTOMER",
      isActive: true,
      isVerified: false,
      passwordHash,
    });

    await expect(login({ userName: "u1", password: "CorrectPass1" } as any)).rejects.toThrow(/chưa được xác thực/);
  });

  it("đăng nhập thành công trả về accessToken + refreshToken hợp lệ và lưu refresh token vào DB", async () => {
    const passwordHash = await bcrypt.hash("CorrectPass1", 10);
    (mockedRepo.findByUserName as any).mockResolvedValue({
      id: "user-1",
      email: "u@example.com",
      userName: "u1",
      role: "CUSTOMER",
      isActive: true,
      isVerified: true,
      passwordHash,
    });
    (mockedRepo.createRefreshToken as any).mockResolvedValue({});

    const result = await login({ userName: "u1", password: "CorrectPass1", rememberMe: false } as any);

    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    expect(mockedRepo.createRefreshToken).toHaveBeenCalledTimes(1);

    // accessToken phải verify được bằng đúng secret cấu hình
    const decoded = jwt.verify(result.accessToken, jwtConfig.accessToken.secret) as any;
    expect(decoded.userId).toBe("user-1");
    expect(decoded.role).toBe("CUSTOMER");
  });
});

describe("auth.service — refresh token rotation (reuse detection)", () => {
  it("thu hồi TOÀN BỘ refresh token của user khi token đã dùng bị tái sử dụng (reuse attack)", async () => {
    const refreshToken = jwt.sign({ userId: "user-1" }, jwtConfig.refreshToken.secret);
    // Token hợp lệ về mặt JWT nhưng KHÔNG còn tồn tại trong DB (đã bị revoke trước đó)
    // → đây chính là dấu hiệu refresh token bị đánh cắp và tái sử dụng.
    (mockedRepo.findValidRefreshTokenWithUser as any).mockResolvedValue(null);
    (mockedRepo.revokeAllRefreshTokensByUser as any).mockResolvedValue({});

    await expect(refreshTokenRotation(refreshToken)).rejects.toThrow(UnauthorizedError);
    expect(mockedRepo.revokeAllRefreshTokensByUser).toHaveBeenCalledWith("user-1");
  });

  it("từ chối + thu hồi toàn bộ token khi vượt quá absoluteExpiresAt (hết phiên tuyệt đối)", async () => {
    const refreshToken = jwt.sign({ userId: "user-1" }, jwtConfig.refreshToken.secret);
    (mockedRepo.findValidRefreshTokenWithUser as any).mockResolvedValue({
      id: "token-row-1",
      absoluteExpiresAt: new Date(Date.now() - 1000), // đã hết hạn tuyệt đối
      ttlType: "short",
      user: { id: "user-1", role: "CUSTOMER", userName: "u1", email: "u@example.com" },
    });
    (mockedRepo.revokeAllRefreshTokensByUser as any).mockResolvedValue({});

    await expect(refreshTokenRotation(refreshToken)).rejects.toThrow(/Session đã hết hạn/);
    expect(mockedRepo.revokeAllRefreshTokensByUser).toHaveBeenCalledWith("user-1");
  });

  it("xoay vòng thành công: revoke token cũ, cấp token mới", async () => {
    const refreshToken = jwt.sign({ userId: "user-1" }, jwtConfig.refreshToken.secret);
    (mockedRepo.findValidRefreshTokenWithUser as any).mockResolvedValue({
      id: "token-row-1",
      absoluteExpiresAt: new Date(Date.now() + 1000 * 60 * 60),
      ttlType: "short",
      userAgent: "vitest",
      ip: "127.0.0.1",
      deviceName: "test-device",
      browser: "vitest",
      location: null,
      user: { id: "user-1", role: "CUSTOMER", userName: "u1", email: "u@example.com" },
    });
    (mockedRepo.touchRefreshTokenLastUsed as any).mockResolvedValue({});
    (mockedRepo.revokeRefreshTokenById as any).mockResolvedValue({});
    (mockedRepo.createRefreshToken as any).mockResolvedValue({});

    const result = await refreshTokenRotation(refreshToken);

    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    // Token cũ PHẢI bị revoke (rotation) — không được để refresh token dùng lại được nhiều lần
    expect(mockedRepo.revokeRefreshTokenById).toHaveBeenCalledWith("token-row-1");
  });
});

describe("auth.service — forgot / reset password", () => {
  it("forgotPassword luôn trả thông báo generic dù email không tồn tại (chống dò email)", async () => {
    (mockedRepo.findByEmail as any).mockResolvedValue(null);

    const result = await forgotPassword("khong-ton-tai@example.com", {} as any);

    expect(result.message).toMatch(/Nếu email tồn tại/);
  });

  it("resetPassword từ chối token không tồn tại trong DB dù chữ ký JWT hợp lệ", async () => {
    // Token có type "reset" và ký đúng secret resetToken, NHƯNG không có bản ghi
    // tương ứng trong DB (VD: đã dùng rồi, hoặc bị forge từ 1 secret trùng khác).
    const forgedToken = jwt.sign({ userId: "user-1", type: "reset" }, jwtConfig.resetToken.secret, {
      expiresIn: jwtConfig.resetToken.expiresIn,
    });
    (mockedRepo.findPasswordResetToken as any).mockResolvedValue(null);

    await expect(resetPassword({ token: forgedToken, password: "NewPass123", confirmPassword: "NewPass123" } as any)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it("resetPassword từ chối token thiếu claim type=reset (VD: lỡ truyền access token vào)", async () => {
    // accessToken hợp lệ của chính user đó nhưng KHÔNG phải reset token —
    // dù cùng dạng JWT, thiếu claim "type" phải bị từ chối ngay, không query DB.
    const notAResetToken = jwt.sign({ userId: "user-1" }, jwtConfig.resetToken.secret);

    await expect(
      resetPassword({ token: notAResetToken, password: "NewPass123", confirmPassword: "NewPass123" } as any),
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(mockedRepo.findPasswordResetToken).not.toHaveBeenCalled();
  });

  it("resetPassword thành công khi token hợp lệ + có bản ghi DB khớp", async () => {
    const resetToken = jwt.sign({ userId: "user-1", type: "reset" }, jwtConfig.resetToken.secret, {
      expiresIn: jwtConfig.resetToken.expiresIn,
    });
    (mockedRepo.findPasswordResetToken as any).mockResolvedValue({
      userId: "user-1",
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });
    (mockedRepo.updatePassword as any).mockResolvedValue({ id: "user-1" });
    (mockedRepo.deletePasswordResetToken as any).mockResolvedValue({});

    await resetPassword({ token: resetToken, password: "NewPass123", confirmPassword: "NewPass123" } as any);

    expect(mockedRepo.updatePassword).toHaveBeenCalledWith("user-1", expect.any(String));
  });
});
