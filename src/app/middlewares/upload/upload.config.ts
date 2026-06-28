import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";
import { storage } from "./multerStorage";

// ─── Shared ───────────────────────────────────────────────────────────────────

const IMAGE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB

const allowedImageMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const allowedImageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

/** Filter chỉ cho phép ảnh, dùng cho hầu hết các entity */
function createImageFilter(entityName: string) {
  return (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error(`${entityName} chỉ cho phép upload ảnh`));
    }
    cb(null, true);
  };
}

// ─── Uploads ──────────────────────────────────────────────────────────────────

/** User avatar */
export const userUpload = multer({
  storage,
  fileFilter: createImageFilter("Avatar"),
  limits: { fileSize: IMAGE_SIZE_LIMIT },
});

/** Blog thumbnail / content images */
export const blogUpload = multer({
  storage,
  fileFilter: createImageFilter("Blog"),
  limits: { fileSize: IMAGE_SIZE_LIMIT },
});

/** Brand logo */
export const brandUpload = multer({
  storage,
  fileFilter: createImageFilter("Brand"),
  limits: { fileSize: IMAGE_SIZE_LIMIT },
});

/** Campaign banner */
export const campaignUpload = multer({
  storage,
  fileFilter: createImageFilter("Campaign"),
  limits: { fileSize: IMAGE_SIZE_LIMIT },
});

/** Category image */
export const categoryUpload = multer({
  storage,
  fileFilter: createImageFilter("Category"),
  limits: { fileSize: IMAGE_SIZE_LIMIT },
});

/** Media library */
export const mediaUpload = multer({
  storage,
  fileFilter: createImageFilter("Media"),
  limits: { fileSize: IMAGE_SIZE_LIMIT },
});

/**
 * Product images + JSON fields (variants, specifications)
 * Khác với các entity khác: cho phép field JSON đi kèm file ảnh
 */
export const productUpload = multer({
  storage,
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const jsonFields = ["variants", "specifications"];
    if (jsonFields.includes(file.fieldname)) {
      return cb(null, true);
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype.toLowerCase();

    if (allowedImageExts.includes(ext) && allowedImageMimes.includes(mime)) {
      cb(null, true);
    } else {
      cb(new Error("Ảnh product không hợp lệ"));
    }
  },
  limits: { fileSize: IMAGE_SIZE_LIMIT },
});

/**
 * Settings images: logo, favicon, OG image
 *
 * group=general  → logo_url, favicon_url
 * group=seo      → og_image_url
 * group=invoice  → logo_url
 */
export const settingsUpload = multer({
  storage,
  fileFilter: createImageFilter("Settings"),
  limits: { fileSize: IMAGE_SIZE_LIMIT },
});

export const SETTINGS_IMAGE_FIELDS = [
  { name: "logo_url", maxCount: 1 },
  { name: "favicon_url", maxCount: 1 },
  { name: "og_image_url", maxCount: 1 },
] as const;

export type SettingsImageField = (typeof SETTINGS_IMAGE_FIELDS)[number]["name"];
