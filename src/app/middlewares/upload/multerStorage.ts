import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os";
import { Request } from "express";

// Thư mục tạm
const tmpDir = path.join(os.tmpdir(), "uploads");

if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

// Mime -> extension "an toàn" do SERVER quyết định. KHÔNG bao giờ lấy phần mở
// rộng file trực tiếp từ `file.originalname` (client tự đặt tên + tự khai báo
// mimetype trong multipart request, cả 2 đều giả mạo được, VD: đặt tên
// "shell.php" kèm Content-Type "image/jpeg"). Áp dụng cho MỌI upload dùng
// storage này (avatar, blog, brand, campaign, category, media, settings,
// product...), bất kể fileFilter của từng loại có check ext hay chưa —
// đây là lớp phòng thủ cuối trước khi ghi file ra đĩa.
export const MIME_TO_SAFE_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

export const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    cb(null, tmpDir);
  },

  filename: (req: Request, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const mime = file.mimetype.toLowerCase();
    const safeExt = MIME_TO_SAFE_EXT[mime] ?? ".bin";
    cb(null, file.fieldname + "-" + uniqueSuffix + safeExt);
  },
});
