import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

/**
 * Xác thực webhook từ các provider vận chuyển (GHN/GHTK/VTP) bằng shared
 * secret, vì các provider này không có chuẩn HMAC signature thống nhất cho
 * webhook — cách phổ biến và được hỗ trợ là tự nhúng 1 secret ngẫu nhiên vào
 * URL webhook khi cấu hình trên dashboard của từng provider.
 *
 * SETUP BẮT BUỘC trước khi đưa vào production (cho mỗi provider có bật webhook):
 *  1. Sinh 1 chuỗi ngẫu nhiên đủ dài, đặt vào biến môi trường
 *     SHIPPING_WEBHOOK_SECRET_<PROVIDER_CODE> (VD: SHIPPING_WEBHOOK_SECRET_GHN).
 *  2. Trên dashboard của provider, cấu hình URL webhook kèm query param
 *     ?secret=<cùng giá trị đó>, VD:
 *     https://api.example.com/api/v1/shipping/webhook/GHN?secret=xxxxxxxx
 *
 * Nếu secret cho 1 provider chưa được cấu hình:
 *  - production: từ chối toàn bộ webhook của provider đó (fail closed).
 *  - ngoài production (dev/staging): cho qua kèm cảnh báo trong log, để không
 *    chặn việc phát triển/test cục bộ khi chưa cấu hình đầy đủ.
 */
export const verifyShippingWebhookSecret = (req: Request, res: Response, next: NextFunction) => {
  const providerCode = String(req.params.providerCode || "").toUpperCase();
  const envKey = `SHIPPING_WEBHOOK_SECRET_${providerCode}`;
  const expectedSecret = process.env[envKey];

  if (!expectedSecret) {
    if (process.env.NODE_ENV === "production") {
      console.error(`[Shipping Webhook] Thiếu ${envKey} — từ chối webhook từ provider "${providerCode}".`);
      return res.status(403).json({ success: false, message: "Webhook chưa được cấu hình xác thực" });
    }
    console.warn(`[Shipping Webhook] ${envKey} chưa được set — bỏ qua xác thực (chỉ chấp nhận ngoài production).`);
    return next();
  }

  const provided = typeof req.query.secret === "string" ? req.query.secret : (req.headers["x-webhook-secret"] as string | undefined) || "";

  const expectedBuf = Buffer.from(expectedSecret);
  const providedBuf = Buffer.from(provided);
  const isValid = providedBuf.length === expectedBuf.length && crypto.timingSafeEqual(providedBuf, expectedBuf);

  if (!isValid) {
    console.error(`[Shipping Webhook] Secret không khớp cho provider "${providerCode}".`);
    return res.status(403).json({ success: false, message: "Webhook secret không hợp lệ" });
  }

  next();
};
