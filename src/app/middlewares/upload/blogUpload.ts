import multer from "multer";
import { storage } from "./multerStorage";
import { FileFilterCallback } from "multer";
import { Request } from "express";

const blogImageFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Blog chỉ cho phép upload ảnh"));
  }
  cb(null, true);
};

export const blogUpload = multer({
  storage,
  fileFilter: blogImageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
