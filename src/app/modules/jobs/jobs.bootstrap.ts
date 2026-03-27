import cron from "node-cron";
import { runVoucherExpiryJob } from "./voucher-expiry.job";
import { runUserInactiveJob } from "./user-inactive.job";

export const startJobs = () => {
  // Mỗi ngày lúc 8:00 sáng VN (UTC+7 = 01:00 UTC)
  cron.schedule("0 1 * * *", async () => {
    await runVoucherExpiryJob();
  });

  // Mỗi thứ 2 lúc 9:00 sáng VN
  cron.schedule("0 2 * * 1", async () => {
    await runUserInactiveJob();
  });

  console.log("[Jobs] Cron jobs started");
};
