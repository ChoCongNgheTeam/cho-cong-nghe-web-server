/**
 * Kiểm tra một chuỗi có phải là path nội bộ tương đối an toàn để redirect
 * hay không. Dùng để chặn open-redirect khi giá trị "returnUrl"/"state" đến
 * từ query string do client (hoặc kẻ tấn công) cung cấp.
 *
 * Chấp nhận: "/account", "/orders?tab=1"
 * Từ chối: "https://evil.com", "//evil.com" (protocol-relative), "javascript:...",
 *          bất kỳ chuỗi nào không bắt đầu bằng đúng 1 dấu "/".
 */
export function isSafeInternalPath(value: string): boolean {
  if (typeof value !== "string" || value.length === 0) return false;
  if (!value.startsWith("/")) return false;
  if (value.startsWith("//")) return false; // protocol-relative URL
  if (value.includes("://")) return false;
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1f]/.test(value)) return false; // control chars (VD: \n cho header injection)
  return true;
}
