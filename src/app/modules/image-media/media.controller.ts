import { Request, Response } from "express";
import * as mediaService from "./media.service";
import { MediaType, MediaPosition } from "./media.types";
import { parseMultipartData, uploadMediaImage } from "./media.helpers";
import { cleanupFile } from "@/services/file-cleanup.service";

export const getMediaByTypeHandler = async (req: Request, res: Response) => {
  const media = await mediaService.getMediaByType(req.params.type as MediaType);
  res.json({ data: media, total: media.length, message: "Lấy media thành công" });
};

export const getMediaByPositionHandler = async (req: Request, res: Response) => {
  const media = await mediaService.getMediaByPosition(req.params.position as MediaPosition);
  res.json({ data: media, total: media.length, message: "Lấy media thành công" });
};

export const getMediaByTypeAndPositionHandler = async (req: Request, res: Response) => {
  const media = await mediaService.getMediaByTypeAndPosition(req.query.type as MediaType, req.query.position as MediaPosition);
  res.json({ data: media, total: media.length, message: "Lấy media thành công" });
};

export const getAllActiveMediaHandler = async (req: Request, res: Response) => {
  const grouped = await mediaService.getAllActiveMedia();
  res.json({ data: grouped, message: "Lấy tất cả media thành công" });
};

export const getAllMediaHandler = async (req: Request, res: Response) => {
  const media = await mediaService.getAllMedia();
  res.json({ data: media, total: media.length, message: "Lấy danh sách media thành công" });
};

export const getMediaDetailHandler = async (req: Request, res: Response) => {
  const media = await mediaService.getMediaById(req.params.id);
  res.json({ data: media, message: "Lấy chi tiết media thành công" });
};

export const createMediaHandler = async (req: Request, res: Response) => {
  const file = req.file;

  try {
    const parsedBody = parseMultipartData(req.body);
    const image = file ? await uploadMediaImage(file) : null;

    const media = await mediaService.createMedia({
      ...parsedBody,
      imageUrl: image?.url,
      imagePath: image?.publicId,
    });

    res.status(201).json({ data: media, message: "Tạo media thành công" });
  } finally {
    cleanupFile(file);
  }
};

export const updateMediaHandler = async (req: Request, res: Response) => {
  const file = req.file;

  try {
    const parsedBody = parseMultipartData(req.body);
    const image = file ? await uploadMediaImage(file) : null;

    const media = await mediaService.updateMedia(req.params.id, {
      ...parsedBody,
      ...(image && { imageUrl: image.url, imagePath: image.publicId }),
    });

    res.json({ data: media, message: "Cập nhật media thành công" });
  } finally {
    cleanupFile(file);
  }
};

export const deleteMediaHandler = async (req: Request, res: Response) => {
  await mediaService.deleteMedia(req.params.id);
  res.json({ message: "Xóa media thành công" });
};

export const reorderMediaHandler = async (req: Request, res: Response) => {
  const result = await mediaService.reorderMedia(req.body);
  res.json({ message: result.message });
};
