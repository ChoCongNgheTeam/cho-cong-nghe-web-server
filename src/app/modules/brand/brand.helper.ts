import slugify from "slugify";
import fs from "fs";
import { uploadImage } from "@/services/cloudinary.service";

export const generateBrandSlug = (name: string): string => {
  return slugify(name, {
    lower: true,
    strict: true,
    locale: "vi",
  });
};

export const generateUniqueBrandSlug = async (
  name: string,
  checkSlugExists: (slug: string) => Promise<boolean>,
  existingSlug?: string,
): Promise<string> => {
  const baseSlug = generateBrandSlug(name);

  // Nếu đang update và slug không đổi thì giữ nguyên
  if (existingSlug && existingSlug === baseSlug) {
    return baseSlug;
  }

  let slug = baseSlug;
  let counter = 1;

  while (await checkSlugExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

// Cleanup temporary uploaded files
export const cleanupTempFiles = (files: Express.Multer.File[]) => {
  files.forEach((file) => {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  });
};

// Parse multipart form data
export const parseMultipartData = (body: any): any => {
  let data = { ...body };

  // Parse JSON string if there's a 'data' field
  if (body.data && typeof body.data === "string") {
    try {
      const parsedData = JSON.parse(body.data);
      data = { ...data, ...parsedData };
      delete data.data;
    } catch (e) {
      throw new Error("Invalid JSON format in 'data' field");
    }
  }

  // Boolean fields đã được parse ở middleware, không cần parse lại ở đây

  return data;
};

// Upload brand image
export const uploadBrandImage = async (
  file: Express.Multer.File,
): Promise<{
  imagePath: string;
  imageUrl: string;
}> => {
  const result = await uploadImage(file.path, "brands");

  return {
    imagePath: result.publicId,
    imageUrl: result.url,
  };
};
