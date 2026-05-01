import { Request, Response, NextFunction } from "express";
import { auditLog, AuditAction, AuditSeverity } from "@/app/modules/audit/audit.logger";

// ─── Paths luôn skip ──────────────────────────────────────────────────────────
const SKIP_PATTERNS = [/^\/auth\//, /^\/audit\//, /\/refresh/, /\/logout/, /\/health/, /\/fcm-token/, /\/read$/, /\/read-all$/];

// ─── Method → Action ─────────────────────────────────────────────────────────
const METHOD_TO_ACTION: Record<string, AuditAction> = {
  POST: "CREATE",
  PUT: "UPDATE",
  PATCH: "UPDATE",
  DELETE: "DELETE",
};

// ─── Path → Action override ───────────────────────────────────────────────────
const PATH_ACTION_OVERRIDES: Array<[RegExp, AuditAction]> = [
  [/\/restore/, "RESTORE"],
  [/\/bulk/, "BULK_ACTION"],
  [/\/export/, "EXPORT"],
  [/\/settings/, "SETTINGS_CHANGE"],
  [/\/permissions?/, "PERMISSION_CHANGE"],
  [/\/roles?/, "PERMISSION_CHANGE"],
];

// ─── Path → Module mapping ────────────────────────────────────────────────────
// Dùng regex test trên TOÀN BỘ path để tránh bị lừa bởi segment "admin"
// Thứ tự quan trọng — đặt pattern cụ thể hơn lên trước
const PATH_TO_MODULE: Array<[RegExp, string]> = [
  [/\/blog-with-comments/, "blog"],
  [/\/products?/, "product"],
  [/\/orders?/, "order"],
  [/\/reviews?/, "review"],
  [/\/comments?/, "comment"],
  [/\/blogs?/, "blog"],
  [/\/users?/, "user"],
  [/\/vouchers?/, "voucher"],
  [/\/categories?/, "category"],
  [/\/brands?/, "brand"],
  [/\/banners?/, "banner"],
  [/\/settings/, "settings"],
  [/\/permissions?/, "permission"],
  [/\/roles?/, "role"],
  [/\/upload/, "upload"],
  [/\/media/, "media"],
  [/\/payments?/, "payment"],
  [/\/promotions?/, "promotion"],
  [/\/campaigns?/, "campaign"],
  [/\/checkout/, "checkout"],
  [/\/wishlist/, "wishlist"],
  [/\/addresses?/, "address"],
  [/\/analytics/, "analytics"],
  [/\/attributes?/, "attribute"],
  [/\/specifications?/, "specification"],
  [/\/pages?/, "page"],
  [/\/notifications?/, "notification"],
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const detectAction = (method: string, path: string): AuditAction => {
  for (const [pattern, action] of PATH_ACTION_OVERRIDES) {
    if (pattern.test(path)) return action;
  }
  return METHOD_TO_ACTION[method] ?? "UPDATE";
};

/**
 * Detect module từ path.
 *
 * Vấn đề cũ: path "/products/admin/abc-123" bị strip thành "products/admin/abc-123"
 * rồi split("/")[0] = "products" — đúng. Nhưng nếu path là "/orders/admin/..." thì
 * req.path (Express) là "/admin/..." relative với router mount point.
 *
 * Fix: dùng req.originalUrl thay vì req.path, và test regex trên full path.
 * Regex trong PATH_TO_MODULE match toàn bộ originalUrl nên không bị ảnh hưởng
 * bởi segment "admin", "me", "bulk", "trash".
 */
const detectModule = (originalUrl: string): string => {
  // Strip query string
  const path = originalUrl.split("?")[0];

  for (const [pattern, module] of PATH_TO_MODULE) {
    if (pattern.test(path)) return module;
  }

  // Fallback: lấy segment đầu sau /api/vN/ bỏ qua các segment nội bộ
  const NOISE_SEGMENTS = new Set(["admin", "me", "bulk", "trash", "restore", "permanent", "public"]);
  const segments = path
    .replace(/^\/api\/v\d+\//, "")
    .split("/")
    .filter((s) => s && !NOISE_SEGMENTS.has(s));

  return segments[0] ?? "unknown";
};

const getSeverity = (action: AuditAction, statusCode: number): AuditSeverity => {
  if (statusCode >= 500) return "CRITICAL";
  if (statusCode >= 400) return "WARNING";
  if (action === "DELETE") return "WARNING";
  if (action === "PERMISSION_CHANGE") return "CRITICAL";
  if (action === "BULK_ACTION") return "WARNING";
  return "INFO";
};

const extractTargetId = (req: Request): string | undefined => {
  if (req.params?.id) return req.params.id;
  if (req.params?.tokenId) return req.params.tokenId;
  if (req.params?.slug) return req.params.slug;

  // Fallback từ URL — bỏ qua các segment nội bộ
  const NOISE = new Set(["admin", "me", "bulk", "trash", "restore", "permanent", "public", "status"]);
  const segments = req.path.split("/").filter((s) => s && !NOISE.has(s));
  const last = segments[segments.length - 1];
  if (last && /^[a-z0-9][-a-z0-9]{6,}$/i.test(last)) return last;
  return undefined;
};

const buildDescription = (action: AuditAction, module: string, statusCode: number, responseBody?: any, requestBody?: any): string => {
  const isSuccess = statusCode < 400;
  const suffix = isSuccess ? "thành công" : `thất bại (${statusCode})`;

  const name =
    responseBody?.data?.name ??
    responseBody?.data?.title ??
    responseBody?.data?.slug ??
    responseBody?.data?.code ??
    responseBody?.data?.orderCode ??
    requestBody?.name ??
    requestBody?.title ??
    requestBody?.code ??
    "";
  const label = name ? ` "${name}"` : "";

  const actionVi: Record<AuditAction, string> = {
    CREATE: "Tạo mới",
    UPDATE: "Cập nhật",
    DELETE: "Xóa",
    RESTORE: "Khôi phục",
    LOGIN: "Đăng nhập",
    LOGOUT: "Đăng xuất",
    LOGIN_FAILED: "Đăng nhập thất bại",
    PERMISSION_CHANGE: "Thay đổi quyền",
    BULK_ACTION: "Thao tác hàng loạt",
    EXPORT: "Xuất dữ liệu",
    SETTINGS_CHANGE: "Thay đổi cài đặt",
  };

  const moduleVi: Record<string, string> = {
    product: "sản phẩm",
    order: "đơn hàng",
    review: "đánh giá",
    comment: "bình luận",
    blog: "bài viết",
    user: "tài khoản",
    voucher: "voucher",
    category: "danh mục",
    brand: "thương hiệu",
    banner: "banner",
    settings: "cài đặt",
    permission: "phân quyền",
    role: "vai trò",
    upload: "file",
    media: "media",
    payment: "thanh toán",
    promotion: "khuyến mãi",
    campaign: "chiến dịch",
    checkout: "đặt hàng",
    wishlist: "yêu thích",
    address: "địa chỉ",
    analytics: "thống kê",
    attribute: "thuộc tính",
    specification: "thông số",
    page: "trang",
    notification: "thông báo",
  };

  return `${actionVi[action] ?? action} ${moduleVi[module] ?? module}${label} ${suffix}`;
};

// ─── Middleware ───────────────────────────────────────────────────────────────

export const auditMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return next();
  if (SKIP_PATTERNS.some((p) => p.test(req.path))) return next();

  // Capture response body — làm sớm nhất có thể
  const originalJson = res.json.bind(res);
  let capturedResponse: any;
  res.json = function (body: any) {
    capturedResponse = body;
    return originalJson(body);
  };

  res.on("finish", () => {
    try {
      // ✅ Check req.user ở đây — authMiddleware đã chạy xong
      if (!req.user) return;

      // Dùng req.originalUrl (full path kể cả prefix /api/v1/...)
      // để detectModule hoạt động đúng với mọi router mount point
      const action = detectAction(req.method, req.originalUrl);
      const module = detectModule(req.originalUrl);
      const targetId = extractTargetId(req);
      const statusCode = res.statusCode;
      const isSuccess = statusCode < 400;

      let diff: { before?: unknown; after?: unknown } | undefined;
      if (["UPDATE", "SETTINGS_CHANGE"].includes(action)) {
        const before = (res.locals as any).auditBefore;
        diff = {
          before: before ?? undefined,
          after: req.body && Object.keys(req.body).length > 0 ? req.body : undefined,
        };
        if (!diff.before && !diff.after) diff = undefined;
      }

      auditLog({
        userId: req.user.id,
        userName: (req.user as any).userName ?? (req.user as any).email ?? req.user.id,
        userRole: req.user.role,
        action,
        module,
        targetId,
        targetType: module,
        description: buildDescription(action, module, statusCode, capturedResponse, req.body),
        diff,
        severity: getSeverity(action, statusCode),
        isSuccess,
        errorMsg: isSuccess ? undefined : (capturedResponse?.message ?? `HTTP ${statusCode}`),
        req,
      });
    } catch (err) {
      console.error("[AuditMiddleware] Error:", err);
    }
  });

  next();
};
