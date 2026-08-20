import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import os from "os";
import { Request } from "express";

// Thư mục tạm trong OS
const tmpDir = path.join(os.tmpdir(), "product-uploads");

if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

// Mime -> extension "an toàn" do SERVER quyết định, không bao giờ lấy trực
// tiếp phần mở rộng do client gửi lên (originalname có thể giả mạo, VD:
// "shell.php" kèm mimetype "image/jpeg" giả).
const MIME_TO_SAFE_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

const allowedExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const allowedMimes = Object.keys(MIME_TO_SAFE_EXT);

// Cấu hình lưu file tạm
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, tmpDir);
  },

  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const mime = file.mimetype.toLowerCase();

    // fileFilter đã đảm bảo mime nằm trong whitelist trước khi tới đây,
    // nhưng vẫn fallback an toàn nếu không map được (không nên xảy ra).
    const safeExt = MIME_TO_SAFE_EXT[mime] ?? ".bin";

    cb(null, file.fieldname + "-" + uniqueSuffix + safeExt);
  },
});

export const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const jsonFields = ["variants", "specifications"];
  if (jsonFields.includes(file.fieldname) && file.mimetype === "application/json") {
    return cb(null, true);
  }

  if (!file.originalname || file.originalname.trim() === "") {
    return cb(null, false);
  }

  const cleanName = file.originalname.split(";")[0].trim();

  if (!cleanName) {
    return cb(null, false);
  }

  const ext = path.extname(cleanName).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  // Cả extension VÀ mimetype đều phải hợp lệ (AND, không phải OR).
  // mimetype do client tự khai báo nên có thể bị giả mạo — chỉ dùng nó kết
  // hợp với extension, không bao giờ tin một mình mimetype, và không bao
  // giờ dùng extension gốc của client để đặt tên file lưu trên đĩa (xem
  // `filename` ở trên: extension lưu trên đĩa luôn do server suy ra từ mime
  // đã whitelist, không lấy từ `file.originalname`).
  if (allowedExts.includes(ext) && allowedMimes.includes(mime)) {
    cb(null, true);
  } else {
    cb(new Error(`Chỉ chấp nhận ảnh jpg, jpeg, png, gif, webp. Nhận được: ${cleanName} (${mime})`));
  }
};

// Export middleware upload
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
