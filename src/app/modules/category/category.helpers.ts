import { uploadImage, deleteImage } from "@/services/cloudinary.service";

export const buildCategoryPath = (category: any): string[] => {
  const path: string[] = [];

  let current = category;
  while (current) {
    if (current.id) path.push(current.id);
    current = current.parent;
  }

  return path;
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

  if (data.position !== undefined && typeof data.position === "string") {
    data.position = parseInt(data.position, 10);
  }

  return data;
};

export const uploadCategoryImage = async (file: Express.Multer.File) => {
  if (!file) return null;

  const result = await uploadImage(file.path, "categories");

  return {
    publicId: result.publicId,
    url: result.url,
  };
};

export const deleteOldCategoryImage = async (imagePath?: string) => {
  if (imagePath) {
    try {
      await deleteImage(imagePath);
    } catch (error) {
      console.error("Error deleting old category image:", error);
    }
  }
};
