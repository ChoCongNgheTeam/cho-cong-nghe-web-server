import { Request, Response, NextFunction } from "express";
import fs from "fs";

export const parseJsonFields = (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || !Array.isArray(files)) {
      return next();
    }

    // Tách JSON và images
    const imageFiles: Express.Multer.File[] = [];

    files.forEach((file) => {
      if (file.mimetype === "application/json") {
        // Đọc và parse JSON
        const content = fs.readFileSync(file.path, "utf-8");
        req.body[file.fieldname] = JSON.parse(content);
        // Xóa file tạm
        fs.unlinkSync(file.path);
      } else {
        imageFiles.push(file);
      }
    });

    // Ghi đè req.files chỉ với images
    req.files = imageFiles;

    next();
  } catch (error) {
    next(error);
  }
};
