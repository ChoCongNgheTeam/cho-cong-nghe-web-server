import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

// ==========================
// Cloudinary config
// ==========================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// ==========================
// Base content folder
// ==========================
const CONTENT_DIR = path.join(process.cwd(), "content");

// ==========================
// Helpers
// ==========================
function walkDir(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);

  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      results = results.concat(walkDir(filePath));
    } else {
      results.push(filePath);
    }
  }

  return results;
}

function isImage(file: string) {
  return /\.(png|jpe?g|webp|avif|gif)$/i.test(file);
}

// ==========================
// Upload content images
// ==========================
async function uploadContent() {
  console.log("🚀 Uploading content images...\n");

  if (!fs.existsSync(CONTENT_DIR)) {
    console.error("❌ content/ folder not found");
    process.exit(1);
  }

  const files = walkDir(CONTENT_DIR).filter(isImage);

  if (files.length === 0) {
    console.warn("⚠️ No images found in content/");
    return;
  }

  // 👉 Lưu lại link của ảnh vừa upload
  const uploadedUrls: {
    path: string;
    url: string;
  }[] = [];

  for (const filePath of files) {
    const relativePath = path.relative(CONTENT_DIR, filePath).replace(/\\/g, "/");

    const folder = `products-content/${path.dirname(relativePath)}`;
    const publicId = path.basename(relativePath, path.extname(relativePath));

    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder,
        public_id: publicId,
        overwrite: true,
        resource_type: "image",
      });

      uploadedUrls.push({
        path: relativePath,
        url: result.secure_url,
      });

      // 👉 log gọn trong lúc upload
      console.log(`✅ Uploaded: ${relativePath}`);
    } catch (error) {
      console.error(`🔥 Upload failed: ${relativePath}`, error);
    }
  }

  // ==========================
  // Final copy-friendly output
  // ==========================
  console.log("\n📋 COPY LINKS BELOW:\n");

  uploadedUrls.forEach((item) => {
    console.log(item.url);
  });

  console.log("\n🎉 Content upload finished");
}

// ==========================
// Run
// ==========================
uploadContent().catch((e) => {
  console.error("❌ Script error:", e);
});
