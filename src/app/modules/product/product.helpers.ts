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
  const fieldsToParse = ["variants", "highlights", "specifications", "colorImages"];

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
        data[field] = data[field];
      }
    }
  });

  return data;
};

/**
 * Upload color-based images
 * Expected format: colorImages = [{ color, altText }]
 * Files fieldname: `color_${color}_${index}`
 */
export const uploadColorImages = async (
  colorImages: any[],
  files: Express.Multer.File[],
): Promise<any[]> => {
  if (!files || files.length === 0) return [];

  const uploadedImages: any[] = [];

  // Group files by color
  const filesByColor = new Map<string, Express.Multer.File[]>();

  files.forEach((file) => {
    // Expected fieldname: color_red_0, color_blue_1, etc.
    const match = file.fieldname.match(/^color_([^_]+)_(\d+)$/);
    if (match) {
      const color = match[1];
      if (!filesByColor.has(color)) {
        filesByColor.set(color, []);
      }
      filesByColor.get(color)!.push(file);
    }
  });

  // Upload images for each color
  for (const [color, colorFiles] of filesByColor.entries()) {
    const uploadPromises = colorFiles.map((file, index) =>
      uploadImage(file.path, "products").then((result) => ({
        ...result,
        position: index,
      })),
    );

    const uploaded = await Promise.all(uploadPromises);

    // Find matching color config from colorImages
    const colorConfig = colorImages.find((ci) => ci.color === color) || { altText: color };

    uploaded.forEach((img) => {
      uploadedImages.push({
        color,
        imagePath: img.publicId,
        imageUrl: img.url,
        altText: colorConfig.altText || color,
        position: img.position,
      });
    });
  }

  return uploadedImages;
};

export const deleteOldImages = async (imageUrls: string[]): Promise<void> => {
  const deletePromises = imageUrls.map(async (url) => {
    try {
      const publicId = extractPublicId(url);
      if (publicId) {
        await deleteImage(publicId);
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
