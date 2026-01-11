import { Router } from "express";
import { upload } from "src/app/middlewares/upload.middleware"; // Middleware Multer của bạn
import { uploadFileHandler } from "./upload.controller";

const router = Router();

// Route chung: POST /api/upload
// Client gửi form-data: 
// - image: (file)
// - folder: "products" | "avatars" (text - optional)
router.post(
  "/",
  upload.single("image"), 
  uploadFileHandler
);

export default router;