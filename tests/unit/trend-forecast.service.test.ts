import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Prisma: bắt lại chính xác giá trị nào được đưa vào raw SQL, để xác
// nhận "days" luôn đi qua dưới dạng PARAMETER (nằm trong mảng `values`,
// không bao giờ bị nội suy trực tiếp vào chuỗi SQL `strings`).
const queryRawMock = vi.fn().mockResolvedValue([]);

vi.mock("@/config/db", () => ({
  default: {
    $queryRaw: (...args: any[]) => queryRawMock(...args),
    $executeRaw: vi.fn().mockResolvedValue(0),
    $transaction: vi.fn(async (fn: any) => fn({ $executeRaw: vi.fn().mockResolvedValue(0) })),
  },
}));

import { trendForecastService } from "@/app/modules/trend-forecast/trend-forecast.service";

beforeEach(() => {
  queryRawMock.mockClear();
});

describe("trend-forecast.service — SQL injection defence (sanitizeDays)", () => {
  it("dùng parameterized query: SQL string cố định, 'days' nằm trong mảng values riêng", async () => {
    await trendForecastService.getSearchTrends(7);

    expect(queryRawMock).toHaveBeenCalledTimes(1);
    const [strings, ...values] = queryRawMock.mock.calls[0];

    // `strings` là mảng các đoạn SQL cố định (từ tagged template) — không được
    // chứa số "7" hay bất kỳ giá trị nào của input, vì nếu có nghĩa là input
    // đã bị nội suy trực tiếp vào SQL (chính là lỗ hổng SQLi ban đầu).
    const sqlSkeleton = strings.join("?");
    expect(sqlSkeleton).not.toContain("7");
    expect(values).toContain(7);
  });

  it("payload SQL injection bị clamp về giá trị mặc định an toàn (7), không lọt vào SQL", async () => {
    const maliciousPayload = "1); DROP TABLE users;--" as unknown as number;

    await trendForecastService.getSearchTrends(maliciousPayload);

    const [strings, ...values] = queryRawMock.mock.calls[0];
    const sqlSkeleton = strings.join("?");

    expect(sqlSkeleton.toLowerCase()).not.toContain("drop table");
    // Giá trị không hợp lệ → sanitizeDays() fallback về 7 (mặc định an toàn)
    expect(values).toContain(7);
  });

  it("giới hạn 'days' tối đa 365 dù input lớn hơn nhiều (chống quét toàn bộ dữ liệu)", async () => {
    await trendForecastService.getSearchTrends(999999);

    const [, ...values] = queryRawMock.mock.calls[0];
    expect(values).toContain(365);
    expect(values).not.toContain(999999);
  });

  it("số âm / số 0 cũng bị fallback về mặc định an toàn (7)", async () => {
    await trendForecastService.getSearchTrends(-5);
    const [, ...valuesNeg] = queryRawMock.mock.calls[0];
    expect(valuesNeg).toContain(7);

    queryRawMock.mockClear();
    await trendForecastService.getSearchTrends(0);
    const [, ...valuesZero] = queryRawMock.mock.calls[0];
    expect(valuesZero).toContain(7);
  });
});
