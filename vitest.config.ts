import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    // Test tuần tự trong cùng 1 file/describe khi đụng DB dùng chung, để
    // tránh race condition giữa các test case (VD: đăng ký cùng 1 email).
    fileParallelism: false,
    testTimeout: 15000,
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.d.ts", "src/generated/**", "src/scripts/**"],
    },
  },
});
