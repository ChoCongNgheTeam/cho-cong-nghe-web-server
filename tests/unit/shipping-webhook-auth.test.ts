import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { verifyShippingWebhookSecret } from "@/app/modules/shipping/shipping.webhook-auth";

function buildReqRes(providerCode: string, secretQuery?: string, secretHeader?: string) {
  const req: any = {
    params: { providerCode },
    query: secretQuery !== undefined ? { secret: secretQuery } : {},
    headers: secretHeader !== undefined ? { "x-webhook-secret": secretHeader } : {},
  };
  const json = vi.fn();
  const res: any = { status: vi.fn().mockReturnValue({ json }), _json: json };
  const next = vi.fn();
  return { req, res, next };
}

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("shipping.webhook-auth — verifyShippingWebhookSecret", () => {
  it("production + thiếu secret cấu hình -> từ chối (fail-closed), KHÔNG gọi next()", () => {
    process.env.NODE_ENV = "production";
    delete process.env.SHIPPING_WEBHOOK_SECRET_GHN;

    const { req, res, next } = buildReqRes("GHN");
    verifyShippingWebhookSecret(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("dev/staging + thiếu secret cấu hình -> vẫn cho qua (không chặn phát triển cục bộ)", () => {
    process.env.NODE_ENV = "development";
    delete process.env.SHIPPING_WEBHOOK_SECRET_GHN;

    const { req, res, next } = buildReqRes("GHN");
    verifyShippingWebhookSecret(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("có cấu hình secret + query param KHÔNG khớp -> từ chối", () => {
    process.env.NODE_ENV = "production";
    process.env.SHIPPING_WEBHOOK_SECRET_GHN = "correct-secret-value";

    const { req, res, next } = buildReqRes("GHN", "wrong-secret");
    verifyShippingWebhookSecret(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("có cấu hình secret + query param khớp đúng -> cho qua", () => {
    process.env.NODE_ENV = "production";
    process.env.SHIPPING_WEBHOOK_SECRET_GHN = "correct-secret-value";

    const { req, res, next } = buildReqRes("GHN", "correct-secret-value");
    verifyShippingWebhookSecret(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("chấp nhận secret truyền qua header x-webhook-secret thay vì query", () => {
    process.env.NODE_ENV = "production";
    process.env.SHIPPING_WEBHOOK_SECRET_GHTK = "ghtk-secret";

    const { req, res, next } = buildReqRes("GHTK", undefined, "ghtk-secret");
    verifyShippingWebhookSecret(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("mỗi provider dùng secret riêng — secret của GHN không được dùng cho GHTK", () => {
    process.env.NODE_ENV = "production";
    process.env.SHIPPING_WEBHOOK_SECRET_GHN = "ghn-secret";
    process.env.SHIPPING_WEBHOOK_SECRET_GHTK = "ghtk-secret";

    const { req, res, next } = buildReqRes("GHTK", "ghn-secret"); // dùng nhầm secret của GHN
    verifyShippingWebhookSecret(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("providerCode không phân biệt hoa/thường (route param 'ghn' vẫn khớp env GHN)", () => {
    process.env.NODE_ENV = "production";
    process.env.SHIPPING_WEBHOOK_SECRET_GHN = "correct-secret";

    const { req, res, next } = buildReqRes("ghn", "correct-secret");
    verifyShippingWebhookSecret(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
