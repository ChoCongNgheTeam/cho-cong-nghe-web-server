import prisma from "@/config/db";
import { Prisma } from "@prisma/client";
import { MediaType, MediaPosition } from "./media.types";

const selectMedia = {
  id: true,
  type: true,
  position: true,
  title: true,
  subTitle: true,
  imagePath: true,
  imageUrl: true,
  linkUrl: true,
  order: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

const buildMediaWhere = (type?: MediaType, position?: MediaPosition, onlyActive: boolean = false): Prisma.image_mediaWhereInput => {
  const where: Prisma.image_mediaWhereInput = {};

  if (onlyActive) {
    where.isActive = true;
  }

  if (type) {
    where.type = type;
  }

  if (position) {
    where.position = position;
  }

  return where;
};

export const findAll = async (onlyActive: boolean = false) => {
  const where = buildMediaWhere(undefined, undefined, onlyActive);

  return prisma.image_media.findMany({
    where,
    select: selectMedia,
    orderBy: [{ position: "asc" }, { order: "asc" }],
  });
};

export const findByType = async (type: MediaType, onlyActive: boolean = true) => {
  const where = buildMediaWhere(type, undefined, onlyActive);

  return prisma.image_media.findMany({
    where,
    select: selectMedia,
    orderBy: [{ position: "asc" }, { order: "asc" }],
  });
};

export const findByPosition = async (position: MediaPosition, onlyActive: boolean = true) => {
  const where = buildMediaWhere(undefined, position, onlyActive);

  return prisma.image_media.findMany({
    where,
    select: selectMedia,
    orderBy: { order: "asc" },
  });
};

export const findByTypeAndPosition = async (type: MediaType, position: MediaPosition, onlyActive: boolean = true) => {
  const where = buildMediaWhere(type, position, onlyActive);

  return prisma.image_media.findMany({
    where,
    select: selectMedia,
    orderBy: { order: "asc" },
  });
};

export const findById = async (id: string) => {
  return prisma.image_media.findUnique({
    where: { id },
    select: selectMedia,
  });
};

export const create = async (data: any) => {
  return prisma.image_media.create({
    data,
    select: selectMedia,
  });
};

export const update = async (id: string, data: any) => {
  return prisma.image_media.update({
    where: { id },
    data,
    select: selectMedia,
  });
};

export const remove = async (id: string) => {
  return prisma.image_media.delete({
    where: { id },
  });
};

export const findSiblings = async (type: MediaType, position: MediaPosition) => {
  return prisma.image_media.findMany({
    where: { type, position },
    select: selectMedia,
    orderBy: { order: "asc" },
  });
};

export const getMaxOrder = async (type: MediaType, position: MediaPosition) => {
  const result = await prisma.image_media.aggregate({
    where: { type, position },
    _max: {
      order: true,
    },
  });
  return result._max.order ?? -1;
};

export const countByTypeAndPosition = async (type: MediaType, position: MediaPosition) => {
  return prisma.image_media.count({
    where: { type, position },
  });
};
