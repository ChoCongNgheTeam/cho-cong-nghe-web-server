import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

const prisma = new PrismaClient();

// ==========================
// Cloudinary config
// ==========================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// ==========================
// Base assets folder
// ==========================
const ASSETS_DIR = path.join(process.cwd(), "assets");

async function uploadAssets() {
  console.log("🚀 Start uploading assets...");

  const images = await prisma.product_color_images.findMany({
    where: {
      imageUrl: null,
    },
  });

  if (images.length === 0) {
    console.log("✅ No images to upload");
    return;
  }

  for (const img of images) {
    const localFilePath = path.join(ASSETS_DIR, img.imagePath);

    if (!fs.existsSync(localFilePath)) {
      console.warn(`❌ File not found: ${localFilePath}`);
      continue;
    }

    try {
      // Normalize path separators to forward slashes
      const normalizedPath = img.imagePath.replace(/\\/g, "/");

      // Split path into folder and filename
      // e.g., "products/iphone-13/black/front.webp"
      const pathParts = normalizedPath.split("/");
      const fileName = pathParts.pop()!; // "front.webp"
      const folderPath = pathParts.join("/"); // "products/iphone-13/black"

      // Remove file extension from filename
      const fileNameWithoutExt = fileName.replace(path.extname(fileName), "");

      const result = await cloudinary.uploader.upload(localFilePath, {
        folder: folderPath, // ✅ Explicitly set folder
        public_id: fileNameWithoutExt, // ✅ Just the filename without extension
        overwrite: true,
        resource_type: "image",
      });

      await prisma.product_color_images.update({
        where: { id: img.id },
        data: {
          imageUrl: result.secure_url,
        },
      });

      console.log(`☁️ Uploaded: ${folderPath}/${fileNameWithoutExt}`);
    } catch (error) {
      console.error(`🔥 Upload failed: ${img.imagePath}`, error);
    }
  }
}

uploadAssets()
  .catch((e) => {
    console.error("❌ Script error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("🔌 Prisma disconnected");
  });
