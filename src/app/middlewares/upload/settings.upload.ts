import multer from "multer";
import { FileFilterCallback } from "multer";
import { Request } from "express";
import { storage } from "./multerStorage";

const settingsImageFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Settings chỉ cho phép upload ảnh"));
  }
  cb(null, true);
};

export const settingsUpload = multer({
  storage,
  fileFilter: settingsImageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

/**
 * Các field ảnh được phép upload trong settings
 * Mỗi field tương ứng với một key trong DB
 *
 * group=general  → logo_url, favicon_url
 * group=seo      → og_image_url
 * group=invoice  → logo_url
 */
export const SETTINGS_IMAGE_FIELDS = [
  { name: "logo_url", maxCount: 1 },
  { name: "favicon_url", maxCount: 1 },
  { name: "og_image_url", maxCount: 1 },
] as const;

export type SettingsImageField = (typeof SETTINGS_IMAGE_FIELDS)[number]["name"];
