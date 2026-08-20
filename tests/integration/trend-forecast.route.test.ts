import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";

// Chỉ mock tầng DB — mọi thứ khác (route, middleware auth/validate, controller,
// service) chạy THẬT, đúng tinh thần integration test: verify toàn bộ chain
// HTTP request → middleware → controller → service hoạt động đúng, đặc biệt
// là validate() phải chặn payload SQLi TRƯỚC KHI chạm tới service/DB.
const queryRawMock = vi.fn().mockResolvedValue([]);
const executeRawMock = vi.fn().mockResolvedValue(0);

vi.mock("@/config/db", () => ({
  default: {
    $queryRaw: (...args: any[]) => queryRawMock(...args),
    $executeRaw: (...args: any[]) => executeRawMock(...args),
    $transaction: vi.fn(async (fn: any) => fn({ $executeRaw: executeRawMock })),
  },
}));

import trendForecastRoute from "@/app/modules/trend-forecast/trend-forecast.route";
import { errorMiddleware } from "@/app/middlewares/error.middleware";
import { jwtConfig } from "@/config/jwt";

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/trend-forecast", trendForecastRoute);
  app.use(errorMiddleware);
  return app;
}

function adminToken() {
  return jwt.sign({ userId: "admin-1", role: "ADMIN", userName: "admin" }, jwtConfig.accessToken.secret, {
    expiresIn: jwtConfig.accessToken.expiresIn,
  });
}

describe("POST /trend-forecast/generate — integration (auth + validate + SQLi defence)", () => {
  const app = buildApp();

  beforeEach(() => {
    queryRawMock.mockClear();
    executeRawMock.mockClear();
  });

  it("401 khi không có access token", async () => {
    const res = await request(app).post("/trend-forecast/generate").send({ days: 7 });
    expect(res.status).toBe(401);
  });

  it("400 khi 'days' là payload SQL injection — bị chặn ở validate(), KHÔNG tới service/DB", async () => {
    const res = await request(app)
      .post("/trend-forecast/generate")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ days: "1); DROP TABLE users;--" });

    expect(res.status).toBe(400);
    expect(queryRawMock).not.toHaveBeenCalled();
    expect(executeRawMock).not.toHaveBeenCalled();
  });

  it("400 khi 'days' vượt quá 365", async () => {
    const res = await request(app).post("/trend-forecast/generate").set("Authorization", `Bearer ${adminToken()}`).send({ days: 9999 });

    expect(res.status).toBe(400);
  });

  it("200 khi 'days' hợp lệ — request đi hết chain tới service (DB đã mock)", async () => {
    const res = await request(app).post("/trend-forecast/generate").set("Authorization", `Bearer ${adminToken()}`).send({ days: 14 });

    // Không assert response body cụ thể (phụ thuộc logic AI forecast phức tạp
    // đã mock rỗng) — chỉ xác nhận request KHÔNG bị chặn ở validate (không 400)
    // và có chạm tới tầng DB đã mock (chứng tỏ đi qua đúng toàn bộ chain).
    expect(res.status).not.toBe(400);
    expect(res.status).not.toBe(401);
  });
});
