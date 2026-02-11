import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

// Global Error Handler Middleware
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Mặc định là lỗi 500 nếu không xác định được
  let statusCode = err.statusCode || 500;
  let message = err.message || "Lỗi máy chủ nội bộ (Internal Server Error)";
  let errors = err.errors || null;

  // 1. Map lỗi của Database (Prisma ORM)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": // Unique constraint failed (VD: Trùng email/username)
        statusCode = 409;
        const target = (err.meta?.target as string[]) || ["Dữ liệu"];
        message = `${target.join(", ")} đã được sử dụng.`;
        break;
      case "P2025": // Record not found (VD: Update user không tồn tại)
        statusCode = 404;
        message = "Không tìm thấy dữ liệu yêu cầu.";
        break;
      case "P2003": // Foreign key constraint failed (VD: Xóa category đang có product)
        statusCode = 400;
        message = "Không thể thao tác do dữ liệu này đang được liên kết ở nơi khác.";
        break;
      default:
        statusCode = 400;
        message = "Lỗi thao tác với cơ sở dữ liệu.";
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Dữ liệu đầu vào không khớp với cấu trúc Database.";
  }

  // 2. Format Response chuẩn hóa theo Swagger Docs của dự án
  const errorResponse: any = { message };
  
  // Nếu có object errors chi tiết (từ Zod hoặc Custom Error) thì đính kèm vào
  if (errors && Object.keys(errors).length > 0) {
    errorResponse.errors = errors;
  }

  // Nếu đang dev thì hiện Stack Trace để dễ debug, lên production thì ẩn đi để bảo mật
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
  }

  // 3. Trả JSON về cho Client
  res.status(statusCode).json(errorResponse);
};