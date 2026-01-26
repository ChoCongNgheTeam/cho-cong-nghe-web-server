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

// ==========================
// Generic upload function
// ==========================
async function uploadImages<T extends { id: string; imagePath: string | null }>(
  items: T[],
  updateFn: (id: string, imageUrl: string) => Promise<unknown>,
) {
  let notFoundCount = 0;

  for (const item of items) {
    if (!item.imagePath) continue;

    const localFilePath = path.join(ASSETS_DIR, item.imagePath);

    if (!fs.existsSync(localFilePath)) {
      notFoundCount++;
      console.warn(`❌ File not found: ${localFilePath}`);
      continue;
    }

    try {
      const normalizedPath = item.imagePath.replace(/\\/g, "/");
      const parts = normalizedPath.split("/");
      const fileName = parts.pop()!;
      const folderPath = parts.join("/");
      const publicId = fileName.replace(path.extname(fileName), "");

      const result = await cloudinary.uploader.upload(localFilePath, {
        folder: folderPath,
        public_id: publicId,
        overwrite: true,
        resource_type: "image",
      });

      await updateFn(item.id, result.secure_url);

      console.log(`☁️ Uploaded: ${folderPath}/${publicId}`);
    } catch (error) {
      console.error(`🔥 Upload failed: ${item.imagePath}`, error);
    }
  }

  console.log(`⚠️ File not found total: ${notFoundCount}`);
}

// ==========================
// Main script
// ==========================
async function uploadAssets() {
  console.log("🚀 Start uploading assets...");

  // -------- Products --------
  const productImages = await prisma.product_color_images.findMany({
    where: { imageUrl: null },
  });

  await uploadImages(productImages, (id, url) =>
    prisma.product_color_images.update({
      where: { id },
      data: { imageUrl: url },
    }),
  );

  // -------- Brands --------
  const brands = await prisma.brands.findMany({
    where: {
      imagePath: { not: null },
      imageUrl: null,
    },
  });

  await uploadImages(brands, (id, url) =>
    prisma.brands.update({
      where: { id },
      data: { imageUrl: url },
    }),
  );

  // -------- Categories --------
  const categories = await prisma.categories.findMany({
    where: {
      imagePath: { not: null },
      imageUrl: null,
    },
  });

  await uploadImages(categories, (id, url) =>
    prisma.categories.update({
      where: { id },
      data: { imageUrl: url },
    }),
  );

  // -------- Images Media --------
  const imagesMedia = await prisma.image_media.findMany({
    where: {
      imagePath: { not: null },
      imageUrl: null,
    },
  });

  await uploadImages(imagesMedia, (id, url) =>
    prisma.image_media.update({
      where: { id },
      data: { imageUrl: url },
    }),
  );

  console.log("✅ All assets uploaded");
}

// ==========================
// Run
// ==========================
uploadAssets()
  .catch((e) => {
    console.error("❌ Script error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("🔌 Prisma disconnected");
  });
