import fs from "fs";
import { uploadImage, deleteImage } from "@/services/cloudinary.service";

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

  const booleanFields = ["isPublished"];
  booleanFields.forEach((field) => {
    if (data[field] !== undefined) {
      if (typeof data[field] === "string") {
        data[field] = data[field].toLowerCase() === "true";
      }
    }
  });

  if (data.publishedAt && typeof data.publishedAt === "string") {
    try {
      data.publishedAt = new Date(data.publishedAt);
    } catch (e) {
      delete data.publishedAt;
    }
  }

  return data;
};

export const uploadThumbnail = async (file: Express.Multer.File) => {
  if (!file) return null;

  const result = await uploadImage(file.path, "blogs");

  return {
    publicId: result.publicId,
    url: result.url,
  };
};

export const deleteOldThumbnail = async (imagePath?: string) => {
  if (imagePath) {
    try {
      await deleteImage(imagePath);
    } catch (error) {
      console.error("Error deleting old thumbnail:", error);
    }
  }
};
