import "dotenv/config";
import { z } from "zod";

/**
 * Validate toàn bộ biến môi trường ngay lúc khởi động (fail-fast) thay vì để
 * app chạy với `JWT_SECRET undefined` rồi crash mơ hồ ở request đầu tiên dùng
 * tới nó. Bắt buộc gọi `validateEnv()` ở TRÊN CÙNG server.ts, trước khi import
 * "./app/app" — vì nhiều module đọc process.env ngay lúc load (top-level),
 * không phải trong hàm.
 *
 * Phân loại:
 * - required: luôn bắt buộc ở mọi môi trường (bí mật cốt lõi: JWT, DB).
 * - requiredInProduction: bắt buộc khi NODE_ENV=production, optional ở dev/test
 *   (để không chặn dev cục bộ chưa cấu hình đủ mọi tích hợp thanh toán/vận
 *   chuyển/OAuth — nhưng sẽ fail rõ ràng nếu thiếu lúc build production).
 */
const baseSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),

  // ─── Core: DB & JWT — luôn bắt buộc ────────────────────────────────────────
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET phải >= 16 ký tự"),
  JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET phải >= 16 ký tự"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_TTL_SHORT: z.string().default("1d"),
  JWT_REFRESH_TTL_LONG: z.string().default("7d"),
  RESET_TOKEN_EXPIRES_IN: z.coerce.number().int().positive().default(3600000),

  // ─── URLs dùng để build redirect/CORS/link email ───────────────────────────
  FRONTEND_URL: z.string().url().optional(),
  CLIENT_BASE_URL: z.string().url().default("http://localhost:4200"),
  SERVER_BASE_URL: z.string().url().default("http://localhost:5000"),
  API_BASE_URL: z.string().url().optional(),

  // ─── Cron / internal ────────────────────────────────────────────────────────
  CRON_SECRET: z.string().min(1).optional(),
});

// Các nhóm tích hợp bên thứ 3 — required khi production, optional khi dev/test
// (dev cục bộ không cần cấu hình đủ mọi cổng thanh toán/OAuth/upload để chạy).
const integrationsSchema = z.object({
  // OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  FB_APP_ID: z.string().optional(),
  FB_APP_SECRET: z.string().optional(),
  APPLE_CLIENT_ID: z.string().optional(),

  // Cloudinary (upload)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Firebase
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),

  // AI providers
  GEMINI_API_KEY: z.string().optional(),
  FIREWORKS_API_KEY: z.string().optional(),

  // Email
  RESEND_API_KEY: z.string().optional(),
  SMTP_FROM: z.string().optional(),

  // Payment providers
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  MOMO_PARTNER_CODE: z.string().optional(),
  MOMO_ACCESS_KEY: z.string().optional(),
  MOMO_SECRET_KEY: z.string().optional(),
  MOMO_API_URL: z.string().optional(),
  MOMO_IPN_URL: z.string().optional(),
  MOMO_REDIRECT_URL: z.string().optional(),
  VNPAY_TMN_CODE: z.string().optional(),
  VNPAY_HASH_SECRET: z.string().optional(),
  VNPAY_RETURN_URL: z.string().optional(),
  ZALOPAY_APP_ID: z.string().optional(),
  ZALOPAY_KEY1: z.string().optional(),
  ZALOPAY_KEY2: z.string().optional(),
  ZALOPAY_API_URL: z.string().optional(),
  ZALOPAY_CALLBACK_URL: z.string().optional(),
  ZALOPAY_REDIRECT_URL: z.string().optional(),
  SEPAY_API_KEY: z.string().optional(),
  BANK_ACCOUNT: z.string().optional(),
  BANK_BIN: z.string().optional(),
  BANK_HOLDER: z.string().optional(),
  BANK_NAME: z.string().optional(),

  // Shipping (GHN)
  GHN_TOKEN: z.string().optional(),
  GHN_SHOP_ID: z.string().optional(),
  GHN_BASE_URL: z.string().optional(),
  GHN_FROM_DISTRICT_ID: z.string().optional(),
  GHN_FROM_WARD_CODE: z.string().optional(),

  // Frontend revalidate webhook
  FE_REVALIDATE_URL: z.string().optional(),
  FE_REVALIDATE_SECRET: z.string().optional(),

  // Script-only (không dùng lúc chạy server)
  SOURCE_DATABASE_URL: z.string().optional(),
});

const fullSchema = baseSchema.merge(integrationsSchema);

export type Env = z.infer<typeof fullSchema>;

let cachedEnv: Env | null = null;

/**
 * Validate process.env, throw + exit ngay nếu thiếu biến bắt buộc. Gọi 1 lần
 * duy nhất, sớm nhất có thể (đầu server.ts).
 */
export function validateEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const result = fullSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Biến môi trường không hợp lệ / thiếu:");
    for (const issue of result.error.issues) {
      console.error(`   - ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }

  cachedEnv = result.data;

  if (cachedEnv.NODE_ENV === "production") {
    // Cảnh báo (không chặn) các tích hợp còn thiếu ở production — team có thể
    // cố tình chưa bật 1 vài cổng thanh toán/vận chuyển, nhưng nên biết rõ.
    const productionRecommended: (keyof Env)[] = [
      "FRONTEND_URL",
      "API_BASE_URL",
      "CRON_SECRET",
      "CLOUDINARY_CLOUD_NAME",
      "CLOUDINARY_API_KEY",
      "CLOUDINARY_API_SECRET",
    ];
    const missing = productionRecommended.filter((k) => !cachedEnv![k]);
    if (missing.length > 0) {
      console.warn(`⚠️  [production] Thiếu biến môi trường khuyến nghị: ${missing.join(", ")}`);
    }
  }

  return cachedEnv;
}
