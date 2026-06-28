import { Request, Response } from "express";
import * as service from "./settings.service";
import { groupParamSchema, updateSettingsSchema } from "./settings.validation";
import { uploadSettingImage } from "./settings.image";
import { cleanupFile } from "@/integrations/file-cleanup.service";
import { SETTINGS_IMAGE_FIELDS, SettingsImageField } from "@/app/middlewares/upload/upload.config";

export const getGroupHandler = async (req: Request, res: Response) => {
  const { group } = groupParamSchema.parse(req.params);
  const data = await service.getGroup(group);
  res.json({ data, message: `Lấy cài đặt nhóm "${group}" thành công` });
};

export const getAllHandler = async (_req: Request, res: Response) => {
  const data = await service.getAll();
  res.json({ data, message: "Lấy tất cả cài đặt thành công" });
};

export const updateGroupHandler = async (req: Request, res: Response) => {
  const { group } = groupParamSchema.parse(req.params);

  // req.files tồn tại khi dùng multer fields()
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;

  // Collect tất cả file temp để cleanup dù thành công hay lỗi
  const allFiles: Express.Multer.File[] = [];
  if (files) {
    for (const field of SETTINGS_IMAGE_FIELDS) {
      if (files[field.name]?.[0]) allFiles.push(files[field.name][0]);
    }
  }

  try {
    // ── 1. Parse body (hỗ trợ cả JSON body & FormData) ────────────────────
    let rawSettings: Record<string, unknown> = {};

    if (req.body?.settings) {
      // JSON body: { settings: { key: value } }
      rawSettings = typeof req.body.settings === "string" ? JSON.parse(req.body.settings) : req.body.settings;
    } else {
      // FormData flat: body chứa trực tiếp các key=value (ngoài file fields)
      rawSettings = { ...req.body };
    }

    // ── 2. Upload ảnh lên Cloudinary & ghi đè vào settings ───────────────
    if (files) {
      for (const field of SETTINGS_IMAGE_FIELDS) {
        const file = files[field.name]?.[0];
        if (file) {
          const uploaded = await uploadSettingImage(field.name, file);
          rawSettings[field.name as SettingsImageField] = uploaded.url;
        }
      }
    }

    // ── 3. Validate toàn bộ settings sau khi đã merge URL ảnh ─────────────
    const input = updateSettingsSchema.parse({ settings: rawSettings });

    // ── 4. Lưu vào DB ─────────────────────────────────────────────────────
    const data = await service.updateGroup(group, input, req.user!.id);

    res.json({ data, message: `Cập nhật cài đặt nhóm "${group}" thành công` });
  } finally {
    // Luôn xoá file temp dù thành công hay lỗi
    allFiles.forEach(cleanupFile);
  }
};
