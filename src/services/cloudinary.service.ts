import cloudinary from "src/config/cloudinary";

export const uploadImage = async (filePath: string, folder = "common") => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
  });

  return {
    publicId: result.public_id,
    url: result.secure_url,
  };
};

export const deleteImage = async (publicId: string) => {
  await cloudinary.uploader.destroy(publicId);
};
