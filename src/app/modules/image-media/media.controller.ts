import { Request, Response } from "express";
import * as mediaService from "./media.service";
import { MediaType, MediaPosition } from "@prisma/client";

// === PUBLIC CONTROLLERS ===

// Lấy media theo type
export const getMediaByTypeHandler = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;

    // Validate enum
    if (!Object.values(MediaType).includes(type as MediaType)) {
      return res.status(400).json({ message: "Type không hợp lệ" });
    }

    const media = await mediaService.getMediaByType(type as MediaType);
    res.json({
      data: media,
      total: media.length,
      message: "Lấy media thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Lỗi server" });
  }
};

// Lấy media theo position
export const getMediaByPositionHandler = async (req: Request, res: Response) => {
  try {
    const { position } = req.params;

    // Validate enum
    if (!Object.values(MediaPosition).includes(position as MediaPosition)) {
      return res.status(400).json({ message: "Position không hợp lệ" });
    }

    const media = await mediaService.getMediaByPosition(position as MediaPosition);
    res.json({
      data: media,
      total: media.length,
      message: "Lấy media thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Lỗi server" });
  }
};

// Lấy media theo type + position
export const getMediaByTypeAndPositionHandler = async (req: Request, res: Response) => {
  try {
    const { type, position } = req.query;

    // Validate enums
    if (!type || !Object.values(MediaType).includes(type as MediaType)) {
      return res.status(400).json({ message: "Type không hợp lệ" });
    }
    if (!position || !Object.values(MediaPosition).includes(position as MediaPosition)) {
      return res.status(400).json({ message: "Position không hợp lệ" });
    }

    const media = await mediaService.getMediaByTypeAndPosition(
      type as MediaType,
      position as MediaPosition,
    );
    res.json({
      data: media,
      total: media.length,
      message: "Lấy media thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Lỗi server" });
  }
};

// Lấy tất cả media active (grouped by position) - cho Home orchestrator
export const getAllActiveMediaHandler = async (req: Request, res: Response) => {
  try {
    const grouped = await mediaService.getAllActiveMedia();
    res.json({
      data: grouped,
      message: "Lấy tất cả media thành công",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Lỗi server" });
  }
};

// === ADMIN CONTROLLERS ===

// Lấy tất cả media (admin)
export const getAllMediaHandler = async (req: Request, res: Response) => {
  try {
    const media = await mediaService.getAllMedia();
    res.json({
      data: media,
      total: media.length,
      message: "Lấy danh sách media thành công",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Lỗi server" });
  }
};

// Lấy media detail (admin)
export const getMediaDetailHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const media = await mediaService.getMediaDetail(id);
    res.json({
      data: media,
      message: "Lấy chi tiết media thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Lỗi server" });
  }
};

// Tạo media
export const createMediaHandler = async (req: Request, res: Response) => {
  try {
    const media = await mediaService.createMedia(req.body);
    res.status(201).json({
      data: media,
      message: "Tạo media thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Lỗi server" });
  }
};

// Update media
export const updateMediaHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const media = await mediaService.updateMedia(id, req.body);
    res.json({
      data: media,
      message: "Cập nhật media thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Lỗi server" });
  }
};

// Delete media
export const deleteMediaHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await mediaService.deleteMedia(id);
    res.json({
      message: "Xóa media thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Lỗi server" });
  }
};

// Reorder media
export const reorderMediaHandler = async (req: Request, res: Response) => {
  try {
    const result = await mediaService.reorderMedia(req.body);
    res.json(result);
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Lỗi server" });
  }
};
