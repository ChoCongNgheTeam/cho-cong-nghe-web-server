import { uploadImage, deleteImage } from "@/services/cloudinary.service";

/**
 * parseMultipartData
 *
 * Hỗ trợ 2 cách gửi từ client:
 *   1. Gửi thẳng field dạng FormData key/value  (gender="MALE", isActive="true")
 *   2. Gửi field `data` là JSON string (FE serialize toàn bộ body thành 1 field)
 *
 * Luôn convert boolean string → boolean thật trước khi Zod validate.
 */
export const parseMultipartData = (body: any): any => {
  let data = { ...body };

  if (body.data && typeof body.data === "string") {
    try {
      const parsedData = JSON.parse(body.data);
      data = { ...data, ...parsedData };
      delete data.data;
    } catch {
      throw new Error("Invalid JSON format in 'data' field");
    }
  }

  const booleanFields = ["isActive", "removeAvatar"];
  booleanFields.forEach((field) => {
    if (data[field] !== undefined && typeof data[field] === "string") {
      data[field] = data[field].toLowerCase() === "true";
    }
  });

  return data;
};

/**
 * uploadAvatarImage
 * Upload file lên Cloudinary vào folder "avatars", trả về url + publicId.
 */
export const uploadAvatarImage = async (file: Express.Multer.File) => {
  if (!file) return null;
  const result = await uploadImage(file.path, "avatars");
  return { url: result.url, publicId: result.publicId };
};

/**
 * deleteOldAvatarImage
 * Xóa ảnh cũ khỏi Cloudinary — bắt lỗi im lặng để không làm crash flow chính.
 */
export const deleteOldAvatarImage = async (imagePath?: string | null) => {
  if (imagePath) {
    try {
      await deleteImage(imagePath);
    } catch (error) {
      console.error("Error deleting old avatar image:", error);
    }
  }
};
