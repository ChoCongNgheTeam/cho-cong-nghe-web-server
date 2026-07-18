import { CacheTag } from "./cache-tags.constants";

const REVALIDATE_URL = process.env.FE_REVALIDATE_URL;
const REVALIDATE_SECRET = process.env.FE_REVALIDATE_SECRET;

/**
 * revalidateTags
 *
 * Báo FE (Next.js) invalidate cache theo tag ngay lập tức, không đợi hết
 * `revalidate` window (VD: sale-schedule 60s, home-products 300s...).
 *
 * Fire-and-forget theo đúng pattern `invalidateFilterCache()`:
 * - Gọi sau khi mutation đã commit DB, KHÔNG `await`.
 * - Lỗi ở đây không được throw / không được làm fail response chính,
 *   vì DB đã ghi thành công rồi — chỉ log lại để theo dõi.
 * - Time-based cache ở FE vẫn là lưới an toàn nếu request này thất bại
 *   (network lỗi, FE down...) — cache sẽ tự làm mới sau khi hết hạn.
 */
export const revalidateTags = (tags: CacheTag[]): void => {
  if (tags.length === 0) return;

  if (!REVALIDATE_URL || !REVALIDATE_SECRET) {
    console.error("revalidateTags: thiếu env FE_REVALIDATE_URL hoặc FE_REVALIDATE_SECRET", { tags });
    return;
  }

  fetch(REVALIDATE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${REVALIDATE_SECRET}`,
    },
    body: JSON.stringify({ tags }),
  })
    .then((res) => {
      if (!res.ok) console.error(`revalidateTags: FE trả về status ${res.status}`, { tags });
    })
    .catch((err) => {
      console.error("revalidateTags: request thất bại", { tags, err });
    });
};
