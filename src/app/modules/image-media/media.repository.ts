import { Prisma, MediaType, MediaPosition } from "@prisma/client";
import prisma from "@/config/db";

const selectMedia = {
  id: true,
  type: true,
  position: true,
  title: true,
  imagePath: true,
  imageUrl: true,
  linkUrl: true,
  order: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

type CreateMediaData = Prisma.image_mediaCreateInput;
type UpdateMediaData = Prisma.image_mediaUpdateInput;

// Lấy tất cả media
export const findAll = async (onlyActive: boolean = false) => {
  return prisma.image_media.findMany({
    where: onlyActive ? { isActive: true } : undefined,
    select: selectMedia,
    orderBy: [{ position: "asc" }, { order: "asc" }],
  });
};

// Lấy media theo type
export const findByType = async (type: MediaType, onlyActive: boolean = true) => {
  return prisma.image_media.findMany({
    where: {
      type,
      ...(onlyActive && { isActive: true }),
    },
    select: selectMedia,
    orderBy: [{ position: "asc" }, { order: "asc" }],
  });
};

// Lấy media theo position (cho Home orchestrator)
export const findByPosition = async (position: MediaPosition, onlyActive: boolean = true) => {
  return prisma.image_media.findMany({
    where: {
      position,
      ...(onlyActive && { isActive: true }),
    },
    select: selectMedia,
    orderBy: { order: "asc" },
  });
};

// Lấy media theo type + position (query cụ thể)
export const findByTypeAndPosition = async (
  type: MediaType,
  position: MediaPosition,
  onlyActive: boolean = true,
) => {
  return prisma.image_media.findMany({
    where: {
      type,
      position,
      ...(onlyActive && { isActive: true }),
    },
    select: selectMedia,
    orderBy: { order: "asc" },
  });
};

// Lấy media theo ID
export const findById = async (id: string) => {
  return prisma.image_media.findUnique({
    where: { id },
    select: selectMedia,
  });
};

// Tạo media
export const create = async (data: CreateMediaData) => {
  return prisma.image_media.create({
    data,
    select: selectMedia,
  });
};

// Update media
export const update = async (id: string, data: UpdateMediaData) => {
  return prisma.image_media.update({
    where: { id },
    data,
    select: selectMedia,
  });
};

// Xóa media
export const remove = async (id: string) => {
  return prisma.image_media.delete({
    where: { id },
  });
};

// Đếm số media cùng type và position
export const countByTypeAndPosition = async (type: MediaType, position: MediaPosition) => {
  return prisma.image_media.count({
    where: { type, position },
  });
};

// Lấy siblings (media cùng type + position)
export const findSiblings = async (type: MediaType, position: MediaPosition) => {
  return prisma.image_media.findMany({
    where: { type, position },
    select: selectMedia,
    orderBy: { order: "asc" },
  });
};

// Lấy max order trong type + position
export const getMaxOrder = async (type: MediaType, position: MediaPosition) => {
  const result = await prisma.image_media.aggregate({
    where: { type, position },
    _max: {
      order: true,
    },
  });
  return result._max.order ?? -1;
};
