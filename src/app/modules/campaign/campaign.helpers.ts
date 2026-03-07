import slugify from "slugify";
import { uploadImage, deleteImage } from "@/services/cloudinary.service";

export const generateCampaignSlug = (name: string): string => {
  return slugify(name, {
    lower: true,
    strict: true,
    locale: "vi",
  });
};

export const generateUniqueCampaignSlug = async (name: string, checkSlugExists: (slug: string) => Promise<boolean>, existingSlug?: string): Promise<string> => {
  const baseSlug = generateCampaignSlug(name);

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

export const uploadCampaignCategoryImage = async (file: Express.Multer.File) => {
  if (!file) return null;

  const result = await uploadImage(file.path, "campaigns");

  return {
    publicId: result.publicId,
    url: result.url,
  };
};

export const deleteCampaignCategoryImage = async (imagePath?: string) => {
  if (imagePath) {
    try {
      await deleteImage(imagePath);
    } catch (error) {
      console.error("Error deleting campaign category image:", error);
    }
  }
};
