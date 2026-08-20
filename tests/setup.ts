// Chạy trước mọi test suite. Set các biến môi trường bắt buộc (theo
// config/env-validation.ts) bằng giá trị giả lập an toàn, để import "app/app"
// hay bất kỳ service nào đọc process.env lúc load module không bị throw/exit
// khi chạy test — không cần .env thật, không đụng tới secret thật.
process.env.NODE_ENV = "test";
process.env.DATABASE_URL ||= "postgresql://test:test@localhost:5432/test_db";
process.env.JWT_SECRET ||= "test-jwt-secret-do-not-use-in-prod";
process.env.JWT_REFRESH_SECRET ||= "test-jwt-refresh-secret-do-not-use";
process.env.JWT_EXPIRES_IN ||= "15m";
process.env.JWT_REFRESH_TTL_SHORT ||= "1d";
process.env.JWT_REFRESH_TTL_LONG ||= "7d";
process.env.FRONTEND_URL ||= "http://localhost:3000";
process.env.API_BASE_URL ||= "http://localhost:5000";
