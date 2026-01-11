import { Request, Response } from "express";
import fs from "fs";
import { uploadImage } from "src/services/cloudinary.service"; // Service cũ của bạn
import { uploadBodySchema } from "./upload.validation";

export const uploadFileHandler = async (req: Request, res: Response) => {
  try {
    // 1. Kiểm tra file
    if (!req.file) {
      return res.status(400).json({ message: "Không có file được upload" });
    }

    // 2. Lấy folder từ body (nếu không gửi thì mặc định là 'products' theo schema)
    // Lưu ý: Multer xử lý form-data, nên req.body sẽ có dữ liệu sau khi qua upload.single()
    const { folder } = uploadBodySchema.parse(req.body);

    // 3. Upload lên Cloudinary với folder động
    const { url, publicId } = await uploadImage(req.file.path, folder);

    // 4. Xóa file tạm
    fs.unlinkSync(req.file.path);

    // 5. Trả về kết quả
    return res.json({
      message: "Upload thành công",
      data: {
        url: url,
        publicId: publicId,
        folder: folder,
      },
    });
  } catch (error: any) {
    // Xóa file tạm nếu có lỗi xảy ra để tránh rác server
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // Xử lý lỗi validation Zod hoặc lỗi server
    if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: error.errors });
    }

    return res.status(500).json({
      message: error.message || "Lỗi upload file",
    });
  }
};