import { Request, Response } from "express";
import * as mediaService from "./media.service";
import { MediaType, MediaPosition } from "./media.types";
import { parseMultipartData, uploadMediaImage } from "./media.helpers";
import { cleanupFile } from "@/services/file-cleanup.service";

export const getMediaByTypeHandler = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;

    if (!Object.values(MediaType).includes(type as MediaType)) {
      return res.status(400).json({
        success: false,
        message: "Type không hợp lệ",
      });
    }

    const media = await mediaService.getMediaByType(type as MediaType);

    res.json({
      success: true,
      data: media,
      total: media.length,
      message: "Lấy media thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const getMediaByPositionHandler = async (req: Request, res: Response) => {
  try {
    const { position } = req.params;

    if (!Object.values(MediaPosition).includes(position as MediaPosition)) {
      return res.status(400).json({
        success: false,
        message: "Position không hợp lệ",
      });
    }

    const media = await mediaService.getMediaByPosition(position as MediaPosition);

    res.json({
      success: true,
      data: media,
      total: media.length,
      message: "Lấy media thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const getMediaByTypeAndPositionHandler = async (req: Request, res: Response) => {
  try {
    const { type, position } = req.query;

    if (!type || !Object.values(MediaType).includes(type as MediaType)) {
      return res.status(400).json({
        success: false,
        message: "Type không hợp lệ",
      });
    }

    if (!position || !Object.values(MediaPosition).includes(position as MediaPosition)) {
      return res.status(400).json({
        success: false,
        message: "Position không hợp lệ",
      });
    }

    const media = await mediaService.getMediaByTypeAndPosition(
      type as MediaType,
      position as MediaPosition,
    );

    res.json({
      success: true,
      data: media,
      total: media.length,
      message: "Lấy media thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const getAllActiveMediaHandler = async (req: Request, res: Response) => {
  try {
    const grouped = await mediaService.getAllActiveMedia();

    res.json({
      success: true,
      data: grouped,
      message: "Lấy tất cả media thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const getAllMediaHandler = async (req: Request, res: Response) => {
  try {
    const media = await mediaService.getAllMedia();

    res.json({
      success: true,
      data: media,
      total: media.length,
      message: "Lấy danh sách media thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const getMediaDetailHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const media = await mediaService.getMediaById(id);

    res.json({
      success: true,
      data: media,
      message: "Lấy chi tiết media thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const createMediaHandler = async (req: Request, res: Response) => {
  const file = req.file;

  try {
    const parsedBody = parseMultipartData(req.body);

    let image = null;
    if (file) {
      image = await uploadMediaImage(file);
    }

    const media = await mediaService.createMedia({
      ...parsedBody,
      imageUrl: image?.url,
      imagePath: image?.publicId,
    });

    cleanupFile(file);

    res.status(201).json({
      success: true,
      data: media,
      message: "Tạo media thành công",
    });
  } catch (error: any) {
    cleanupFile(file);

    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: error.errors,
      });
    }

    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const updateMediaHandler = async (req: Request, res: Response) => {
  const file = req.file;

  try {
    const { id } = req.params;
    const parsedBody = parseMultipartData(req.body);

    let image = null;
    if (file) {
      image = await uploadMediaImage(file);
    }

    const updateData = {
      ...parsedBody,
      ...(image && {
        imageUrl: image.url,
        imagePath: image.publicId,
      }),
    };

    const media = await mediaService.updateMedia(id, updateData);

    cleanupFile(file);

    res.json({
      success: true,
      data: media,
      message: "Cập nhật media thành công",
    });
  } catch (error: any) {
    cleanupFile(file);

    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: error.errors,
      });
    }

    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const deleteMediaHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await mediaService.deleteMedia(id);

    res.json({
      success: true,
      message: "Xóa media thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const reorderMediaHandler = async (req: Request, res: Response) => {
  try {
    const result = await mediaService.reorderMedia(req.body);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};
