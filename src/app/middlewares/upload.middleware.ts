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

// Cấu hình lưu file tạm
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, tmpDir);
  },

  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const jsonFields = ["variants", "specifications"];
  if (jsonFields.includes(file.fieldname) && file.mimetype === "application/json") {
    return cb(null, true);
  }

  if (!file.originalname || file.originalname.trim() === "") {
    return cb(null, false);
  }

  const allowedExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  const cleanName = file.originalname.split(";")[0].trim();

  if (!cleanName) {
    return cb(null, false);
  }

  const ext = path.extname(cleanName).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  if (allowedExts.includes(ext) || allowedMimes.includes(mime)) {
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
