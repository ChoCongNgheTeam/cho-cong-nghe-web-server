import multer from "multer";
import { storage } from "./multerStorage";
import { FileFilterCallback } from "multer";
import { Request } from "express";

const brandImageFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Brand chỉ cho phép upload ảnh"));
  }
  cb(null, true);
};

export const brandUpload = multer({
  storage,
  fileFilter: brandImageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
