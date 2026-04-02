import multer from "multer";
import { storage } from "./multerStorage";
import { FileFilterCallback } from "multer";
import { Request } from "express";

const avatarImageFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Avatar chỉ cho phép upload ảnh"));
  }
  cb(null, true);
};

export const userUpload = multer({
  storage,
  fileFilter: avatarImageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
