import Redis from "ioredis";

/**
 * Redis client dùng cho cache (VD: cache permission trong staff-permissions).
 *
 * Thiết kế graceful-degradation có chủ đích: Redis ở đây chỉ là lớp cache,
 * KHÔNG phải nguồn dữ liệu chính — nếu chưa cấu hình REDIS_URL hoặc Redis
 * down, ứng dụng vẫn phải chạy được bình thường (chỉ mất phần tăng tốc do
 * cache, fallback về query DB trực tiếp), không được để lỗi kết nối Redis
 * làm crash toàn bộ server.
 */
const REDIS_URL = process.env.REDIS_URL;

export const redis = REDIS_URL
  ? new Redis(REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => Math.min(times * 200, 2000),
    })
  : null;

let hasWarnedNoRedis = false;
let hasConnected = false;

if (redis) {
  redis.on("error", (err) => {
    console.warn("[Redis] Lỗi kết nối (sẽ fallback query DB trực tiếp khi cần):", err.message);
  });
  redis.connect().then(() => {
    hasConnected = true;
  }).catch(() => {
    // đã log ở event "error" phía trên
  });
}

/**
 * Lấy giá trị JSON từ cache. Trả về null nếu cache miss, Redis chưa cấu hình,
 * hoặc có lỗi bất kỳ — người gọi luôn phải coi null là "phải query DB",
 * không phải là lỗi cần throw.
 */
export async function cacheGetJSON<T>(key: string): Promise<T | null> {
  if (!redis) {
    if (!hasWarnedNoRedis) {
      console.warn("[Redis] REDIS_URL chưa được cấu hình — bỏ qua cache, luôn query DB trực tiếp.");
      hasWarnedNoRedis = true;
    }
    return null;
  }
  if (!hasConnected) return null;

  try {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (err) {
    console.warn(`[Redis] Lỗi đọc cache key "${key}":`, err);
    return null;
  }
}

/** Ghi giá trị JSON vào cache với TTL (giây). Lỗi bị nuốt có chủ đích (cache không quan trọng bằng flow chính). */
export async function cacheSetJSON(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  if (!redis || !hasConnected) return;
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (err) {
    console.warn(`[Redis] Lỗi ghi cache key "${key}":`, err);
  }
}

/** Xoá 1 key khỏi cache (dùng khi dữ liệu gốc thay đổi — cache invalidation). */
export async function cacheDelete(key: string): Promise<void> {
  if (!redis || !hasConnected) return;
  try {
    await redis.del(key);
  } catch (err) {
    console.warn(`[Redis] Lỗi xoá cache key "${key}":`, err);
  }
}
