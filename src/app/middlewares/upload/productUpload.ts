import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";
import { storage } from "./multerStorage";

const productFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const jsonFields = ["variants", "specifications"];

  if (jsonFields.includes(file.fieldname)) {
    return cb(null, true);
  }

  const allowedExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  if (allowedExts.includes(ext) && allowedMimes.includes(mime)) {
    cb(null, true);
  } else {
    cb(new Error("Ảnh product không hợp lệ"));
  }
};

export const productUpload = multer({
  storage,
  fileFilter: productFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
