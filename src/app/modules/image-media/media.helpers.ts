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

  const booleanFields = ["isActive"];
  booleanFields.forEach((field) => {
    if (data[field] !== undefined) {
      if (typeof data[field] === "string") {
        data[field] = data[field].toLowerCase() === "true";
      }
    }
  });

  const numberFields = ["order"];
  numberFields.forEach((field) => {
    if (data[field] !== undefined) {
      if (typeof data[field] === "string") {
        data[field] = parseInt(data[field], 10);
      }
    }
  });

  return data;
};

export const uploadMediaImage = async (file: Express.Multer.File) => {
  if (!file) return null;

  const result = await uploadImage(file.path, "media");

  return {
    publicId: result.publicId,
    url: result.url,
  };
};

export const deleteOldMediaImage = async (imagePath?: string) => {
  if (imagePath) {
    try {
      await deleteImage(imagePath);
    } catch (error) {
      console.error("Error deleting old media image:", error);
    }
  }
};
