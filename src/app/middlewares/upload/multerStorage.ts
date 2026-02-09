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

export const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    cb(null, tmpDir);
  },

  filename: (req: Request, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// TEST
