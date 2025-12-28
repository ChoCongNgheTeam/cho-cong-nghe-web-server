import "dotenv/config";
// Định nghĩa lại phương thức toJSON cho BigInt
(BigInt.prototype as any).toJSON = function () {
  return this.toString(); // Chuyển BigInt thành String để tránh lỗi
  // Hoặc dùng: return Number(this); // Nếu chắc chắn số không quá lớn vượt mức Number an toàn
};
import app from "./app/app";

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}/api-docs`);
});
