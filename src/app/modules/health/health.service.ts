import prisma from "@/config/db";

// Trả về nhanh, không đụng DB — dùng cho cron ping giữ web không sleep
export const getBasicHealth = () => {
  return {
    status: "ok" as const,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
};

// Check thêm kết nối DB — dùng cho dashboard/monitoring, không dùng cho ping tần suất cao
export const getDetailedHealth = async () => {
  const startedAt = Date.now();
  let dbStatus: "ok" | "error" = "ok";
  let dbLatencyMs: number | null = null;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - startedAt;
  } catch {
    dbStatus = "error";
  }

  return {
    status: dbStatus === "ok" ? ("ok" as const) : ("degraded" as const),
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    db: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
    },
    memory: {
      rssMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
  };
};
