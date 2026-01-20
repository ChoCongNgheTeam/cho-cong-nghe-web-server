import fs from "fs";
import { uploadImage, deleteImage } from "@/services/cloudinary.service";

// Cleanup temporary uploaded files
export const cleanupTempFiles = (files: Express.Multer.File[]) => {
  files.forEach((file) => {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  });
};

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

  // Parse array/object fields if they are strings
  const fieldsToParse = ["variants", "highlights", "specifications"];

  fieldsToParse.forEach((field) => {
    if (data[field] && typeof data[field] === "string") {
      try {
        data[field] = JSON.parse(data[field]);
      } catch (e) {
        throw new Error(`Invalid JSON format in field '${field}'`);
      }
    }
  });

  // Convert boolean fields from string to boolean
  const booleanFields = ["isFeatured", "isActive"];

  booleanFields.forEach((field) => {
    if (data[field] !== undefined) {
      if (typeof data[field] === "string") {
        data[field] = data[field].toLowerCase() === "true";
      } else if (typeof data[field] === "boolean") {
        // Already boolean, keep it
        data[field] = data[field];
      }
    }
  });

  return data;
};

export const uploadVariantImages = async (
  variants: any[],
  files: Express.Multer.File[],
): Promise<void> => {
  if (!files || files.length === 0) return;

  await Promise.all(
    variants.map(async (variant, index) => {
      // Files for this variant have fieldname = `variant_${index}`
      const variantFiles = files.filter((f) => f.fieldname === `variant_${index}`);

      if (variantFiles.length > 0) {
        // Upload to Cloudinary
        const uploadPromises = variantFiles.map((file) => uploadImage(file.path, "products"));
        const uploadedImages = await Promise.all(uploadPromises);

        // Assign to variant.images
        variant.images = uploadedImages.map((img) => ({
          imageUrl: img.url,
          publicId: img.publicId,
          altText: variant.altText || variant.code,
        }));
      } else {
        // Keep existing images if no new upload
        variant.images = variant.images || [];
      }
    }),
  );
};

export const deleteOldImages = async (imageUrls: string[]): Promise<void> => {
  const deletePromises = imageUrls.map(async (url) => {
    try {
      // Extract publicId from Cloudinary URL
      const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
      if (matches && matches[1]) {
        await deleteImage(matches[1]);
      }
    } catch (err) {
      console.error(`Failed to delete image: ${url}`, err);
    }
  });

  await Promise.allSettled(deletePromises);
};

/**
 * Extract public ID from Cloudinary URL
 */
export const extractPublicId = (url: string): string | null => {
  const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
  return matches?.[1] || null;
};
