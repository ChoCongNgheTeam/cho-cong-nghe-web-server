import multer from "multer";
import { storage } from "./multerStorage";
import { FileFilterCallback } from "multer";
import { Request } from "express";

const campaignImageFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Campaign chỉ cho phép upload ảnh "));
  }
  cb(null, true);
};

export const campaignUpload = multer({
  storage,
  fileFilter: campaignImageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
