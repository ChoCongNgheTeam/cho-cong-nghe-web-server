import { describe, it, expect, vi, beforeEach } from "vitest";

const findUniqueMock = vi.fn();
const paymentIntentsCreateMock = vi.fn().mockResolvedValue({ client_secret: "cs_test", id: "pi_test" });

vi.mock("@/config/db", () => ({
  default: {
    orders: { findUnique: (...args: any[]) => findUniqueMock(...args) },
  },
}));

vi.mock("stripe", () => {
  class FakeStripe {
    paymentIntents = { create: (...args: any[]) => paymentIntentsCreateMock(...args) };
    webhooks = { constructEvent: vi.fn() };
  }
  return { default: FakeStripe };
});

beforeEach(() => {
  vi.clearAllMocks();
  process.env.STRIPE_SECRET_KEY = "sk_test_fake";
});

describe("stripe.service — createStripePaymentIntent (chống tamper số tiền)", () => {
  it("LUÔN dùng order.totalAmount từ DB, bỏ qua hoàn toàn số tiền client gửi lên", async () => {
    const { createStripePaymentIntent } = await import("@/app/modules/payment/providers/stripe/stripe.service");

    findUniqueMock.mockResolvedValue({ totalAmount: 500000, paymentStatus: "PENDING" });

    // Client cố tình gửi amount=1 (giả mạo giá 1 đồng) — phải bị bỏ qua hoàn toàn.
    await createStripePaymentIntent("order-1", 1, "vnd");

    expect(paymentIntentsCreateMock).toHaveBeenCalledTimes(1);
    const callArg = paymentIntentsCreateMock.mock.calls[0][0];
    expect(callArg.amount).toBe(500000); // đúng giá trong DB, KHÔNG phải 1
  });

  it("từ chối tạo payment intent nếu đơn hàng đã PAID (chống tạo lại/double charge)", async () => {
    const { createStripePaymentIntent } = await import("@/app/modules/payment/providers/stripe/stripe.service");
    findUniqueMock.mockResolvedValue({ totalAmount: 500000, paymentStatus: "PAID" });

    await expect(createStripePaymentIntent("order-1", 500000, "vnd")).rejects.toThrow(/đã được thanh toán/);
    expect(paymentIntentsCreateMock).not.toHaveBeenCalled();
  });

  it("báo lỗi NotFound nếu đơn hàng không tồn tại", async () => {
    const { createStripePaymentIntent } = await import("@/app/modules/payment/providers/stripe/stripe.service");
    findUniqueMock.mockResolvedValue(null);

    await expect(createStripePaymentIntent("ghost-order", 1000, "vnd")).rejects.toThrow();
    expect(paymentIntentsCreateMock).not.toHaveBeenCalled();
  });
});

describe("stripe.service — lazy init (không crash app khi thiếu STRIPE_SECRET_KEY)", () => {
  it("import module KHÔNG throw dù chưa set STRIPE_SECRET_KEY (client chỉ khởi tạo lúc dùng)", async () => {
    vi.resetModules();
    delete process.env.STRIPE_SECRET_KEY;

    // Import module phải thành công (không throw) — đây chính là bug đã fix:
    // trước đây `new Stripe(...)` chạy ngay lúc import module.
    await expect(import("@/app/modules/payment/providers/stripe/stripe.service")).resolves.toBeDefined();
  });
});
