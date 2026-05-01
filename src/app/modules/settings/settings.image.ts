import { uploadImage } from "@/services/cloudinary.service";

/**
 * Map từ field name → cloudinary folder
 */
const FOLDER_MAP: Record<string, string> = {
  logo_url: "settings/general",
  favicon_url: "settings/general",
  og_image_url: "settings/seo",
};

export const uploadSettingImage = async (field: string, file: Express.Multer.File) => {
  const folder = FOLDER_MAP[field] ?? "settings/general";
  const result = await uploadImage(file.path, folder);
  return {
    publicId: result.publicId,
    url: result.url,
  };
};
