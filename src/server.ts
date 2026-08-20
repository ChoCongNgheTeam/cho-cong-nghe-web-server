import "dotenv/config";
import { validateEnv } from "./config/env-validation";

// Fail-fast: validate toàn bộ biến môi trường bắt buộc TRƯỚC khi import app,
// vì nhiều module đọc process.env ngay lúc load (top-level code), không phải
// trong hàm — nếu import app trước thì lỗi thiếu env sẽ crash mơ hồ ở nơi
// dùng, không rõ ràng như validate tập trung ở đây.
validateEnv();

import app from "./app/app";

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}/api-docs`);
});
