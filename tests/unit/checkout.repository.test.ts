import { describe, it, expect, vi } from "vitest";

// Prisma stub trong môi trường code (offline, không tải được engine thật) không
// export Prisma.Decimal/OrderStatus/PaymentStatus — đây là hạn chế môi trường,
// không phải lỗi thật. Mock lại tối thiểu để chạy test logic nghiệp vụ.
vi.mock("@prisma/client", async (importOriginal) => {
  const actual = await importOriginal<any>();
  class FakeDecimal {
    value: number;
    constructor(v: number) {
      this.value = v;
    }
    toString() {
      return String(this.value);
    }
  }
  return {
    ...actual,
    Prisma: { ...actual.Prisma, Decimal: FakeDecimal },
    OrderStatus: { PENDING: "PENDING", CANCELLED: "CANCELLED" },
    PaymentStatus: { UNPAID: "UNPAID", PAID: "PAID" },
  };
});

// Mock tx object mô phỏng hành vi Postgres thật cho updateMany có điều kiện
// WHERE quantity >= X: chỉ "thành công" (count=1) nếu variant tương ứng còn
// đủ tồn kho tại thời điểm gọi — đúng tinh thần atomic UPDATE...WHERE.
function buildFakeTx(variantStocks: Record<string, number>) {
  const updateManyCalls: any[] = [];

  return {
    calls: updateManyCalls,
    tx: {
      user_addresses: {
        findUnique: vi.fn().mockResolvedValue({
          id: "addr-1",
          contactName: "Nguyen Van A",
          phone: "0912345678",
          provinceName: "Hồ Chí Minh",
          wardName: "Phường 1",
          detailAddress: "123 ABC",
        }),
      },
      orders: {
        create: vi.fn().mockImplementation(async ({ data }: any) => ({
          id: "order-1",
          orderCode: data.orderCode,
          shippingContactName: data.shippingContactName,
          shippingPhone: data.shippingPhone,
          shippingDetail: data.shippingDetail,
          shippingWard: data.shippingWard,
          shippingProvince: data.shippingProvince,
          totalAmount: data.totalAmount,
          orderItems: data.orderItems.create.map((oi: any, idx: number) => ({
            ...oi,
            productVariant: { productId: `product-${idx}`, code: "V1", product: { name: "SP test" } },
          })),
        })),
      },
      products_variants: {
        updateMany: vi.fn().mockImplementation(async ({ where, data }: any) => {
          updateManyCalls.push({ where, data });
          const current = variantStocks[where.id] ?? 0;
          const requiredMin = where.quantity?.gte ?? 0;
          const decrementAmount = data.quantity?.decrement ?? 0;

          if (current < requiredMin) {
            return { count: 0 }; // giả lập Postgres: WHERE không match -> không update dòng nào
          }
          variantStocks[where.id] = current - decrementAmount;
          return { count: 1 };
        }),
      },
      products: {
        update: vi.fn().mockResolvedValue({}),
      },
      cart_items: {
        deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
      vouchers: {
        update: vi.fn().mockResolvedValue({}),
      },
      voucher_usages: {
        create: vi.fn().mockResolvedValue({}),
      },
      voucher_user: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    },
  };
}

vi.mock("@/app/modules/warehouse/warehouse.repository", () => ({
  getDefaultWarehouseId: vi.fn().mockResolvedValue(null), // bỏ qua stock_movements — test tập trung vào phần chính
}));
vi.mock("@/app/modules/inventory/inventory.repository", () => ({
  applyStockMovementTx: vi.fn(),
}));

describe("checkout.repository — executeOrderTransaction (chống oversell / race condition)", () => {
  function buildSummary(overrides: Partial<any> = {}) {
    return {
      items: [{ productVariantId: "variant-1", quantity: 2, unitPrice: 100000, subtotal: 200000, productName: "SP test", variantCode: "V1" }],
      subtotalAmount: 200000,
      shippingFee: 20000,
      voucherDiscount: 0,
      totalPromotionDiscount: 0,
      totalAmount: 220000,
      paymentMethodId: "pm-1",
      paymentMethodCode: "COD",
      shippingAddressId: "addr-1",
      ...overrides,
    };
  }

  it("tạo đơn thành công khi tồn kho đủ, trừ đúng số lượng", async () => {
    vi.resetModules();
    const { tx, calls } = buildFakeTx({ "variant-1": 10 });
    vi.doMock("@/config/db", () => ({ default: { $transaction: (fn: any) => fn(tx) } }));
    const { executeOrderTransaction } = await import("@/app/modules/checkout/checkout.repository");

    const order = await executeOrderTransaction("user-1", buildSummary());

    expect(order.id).toBe("order-1");
    expect(calls).toHaveLength(1);
    expect(calls[0].where).toMatchObject({ id: "variant-1", quantity: { gte: 2 } });
    vi.doUnmock("@/config/db");
  });

  it("TỪ CHỐI tạo đơn khi tồn kho không đủ tại đúng thời điểm ghi (updateMany count=0) — không tạo đơn 'ma'", async () => {
    vi.resetModules();
    // variant chỉ còn 1, nhưng đơn hàng muốn mua 2 -> updateMany phải trả count=0
    const { tx } = buildFakeTx({ "variant-1": 1 });
    vi.doMock("@/config/db", () => ({ default: { $transaction: (fn: any) => fn(tx) } }));
    const { executeOrderTransaction } = await import("@/app/modules/checkout/checkout.repository");
    const { BadRequestError } = await import("@/errors");

    await expect(executeOrderTransaction("user-1", buildSummary())).rejects.toBeInstanceOf(BadRequestError);
    vi.doUnmock("@/config/db");
  });

  it("mô phỏng đúng race condition: 2 người mua đồng thời 1 sản phẩm chỉ còn đúng đủ cho 1 người", async () => {
    vi.resetModules();
    // Stock ban đầu = 2, mỗi đơn mua 2 -> đơn đầu tiên chạy trước thành công,
    // đơn thứ hai chạy sau (cùng logic atomic updateMany) phải bị từ chối,
    // KHÔNG được để cả 2 đều thành công (điều mà code cũ — decrement vô điều
    // kiện — sẽ cho phép, dẫn tới stock âm).
    const shared = buildFakeTx({ "variant-1": 2 });
    vi.doMock("@/config/db", () => ({ default: { $transaction: (fn: any) => fn(shared.tx) } }));
    const { executeOrderTransaction } = await import("@/app/modules/checkout/checkout.repository");

    const results = await Promise.allSettled([
      executeOrderTransaction("user-1", buildSummary()),
      executeOrderTransaction("user-2", buildSummary()),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    vi.doUnmock("@/config/db");
  });
});
