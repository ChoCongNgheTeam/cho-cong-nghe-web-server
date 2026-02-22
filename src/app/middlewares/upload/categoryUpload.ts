import multer from "multer";
import { storage } from "./multerStorage";
import { FileFilterCallback } from "multer";
import { Request } from "express";

const categoryImageFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Category chỉ cho phép upload ảnh"));
  }
  cb(null, true);
};

export const categoryUpload = multer({
  storage,
  fileFilter: categoryImageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
