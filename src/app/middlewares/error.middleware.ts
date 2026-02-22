import { Request, Response, NextFunction } from "express";
import { AppError } from "@/errors";

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      errors: err.errors ?? undefined,
    });
  }

  if (err.name === "PrismaClientInitializationError") {
    console.error("DB CONNECTION ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      code: "DB_CONNECTION_ERROR",
    });
  }

  console.error("UNEXPECTED ERROR:", err);

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    code: "INTERNAL_ERROR",
  });
};
