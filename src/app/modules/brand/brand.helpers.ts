import slugify from "slugify";
import { uploadImage, deleteImage } from "@/services/cloudinary.service";

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

export const parseMultipartData = (body: any): any => {
  let data = { ...body };

  if (body.data && typeof body.data === "string") {
    try {
      const parsedData = JSON.parse(body.data);
      data = { ...data, ...parsedData };
      delete data.data;
    } catch (e) {
      throw new Error("Invalid JSON format in 'data' field");
    }
  }

  const booleanFields = ["isFeatured", "isActive", "removeImage"];
  booleanFields.forEach((field) => {
    if (data[field] !== undefined) {
      if (typeof data[field] === "string") {
        data[field] = data[field].toLowerCase() === "true";
      }
    }
  });

  return data;
};

export const uploadBrandImage = async (file: Express.Multer.File) => {
  if (!file) return null;

  const result = await uploadImage(file.path, "brands");

  return {
    publicId: result.publicId,
    url: result.url,
  };
};

export const deleteOldBrandImage = async (imagePath?: string) => {
  if (imagePath) {
    try {
      await deleteImage(imagePath);
    } catch (error) {
      console.error("Error deleting old brand image:", error);
    }
  }
};
