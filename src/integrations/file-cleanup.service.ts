import fs from "fs";

// Server đầy ổ cứng theo thời gian
// Khó debug
// Dễ crash production

export const cleanupFiles = (files: Express.Multer.File[] = []) => {
  files.forEach((file) => {
    if (file?.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  });
};

export const cleanupFile = (file?: Express.Multer.File) => {
  if (file?.path && fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }
};
