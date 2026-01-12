import { cleanupRefreshTokens } from "@/app/modules/auth/auth.service";
// npm run cleanup:refresh-token

(async () => {
  const deleted = await cleanupRefreshTokens();
  console.log(`[CLEANUP] Deleted ${deleted} refresh tokens`);
  process.exit(0);
})();
