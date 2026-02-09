import * as repo from "./media.repository";
import { transformMedia, transformMediaList } from "./media.transformers";
import { CreateMediaInput, UpdateMediaInput, ReorderMediaInput } from "./media.validation";
import { MediaType, MediaPosition } from "./media.types";
import { deleteOldMediaImage } from "./media.helpers";
import prisma from "@/config/db";

export const getMediaByType = async (type: MediaType) => {
  const media = await repo.findByType(type, true);
  return transformMediaList(media);
};

export const getMediaByPosition = async (position: MediaPosition) => {
  const media = await repo.findByPosition(position, true);
  return transformMediaList(media);
};

export const getMediaByTypeAndPosition = async (type: MediaType, position: MediaPosition) => {
  const media = await repo.findByTypeAndPosition(type, position, true);
  return transformMediaList(media);
};

export const getAllActiveMedia = async () => {
  const media = await repo.findAll(true);
  const transformedMedia = transformMediaList(media);

  const grouped = transformedMedia.reduce(
    (acc, item) => {
      if (!acc[item.position]) {
        acc[item.position] = [];
      }
      acc[item.position].push(item);
      return acc;
    },
    {} as Record<string, typeof transformedMedia>,
  );

  return grouped;
};

export const getAllMedia = async () => {
  const media = await repo.findAll(false);
  return transformMediaList(media);
};

export const getMediaById = async (id: string) => {
  const media = await repo.findById(id);

  if (!media) {
    const error: any = new Error("Không tìm thấy media");
    error.statusCode = 404;
    throw error;
  }

  return transformMedia(media);
};

export const createMedia = async (input: CreateMediaInput) => {
  const { type, position, order, ...rest } = input;

  let finalOrder = order;
  if (finalOrder === undefined) {
    const maxOrder = await repo.getMaxOrder(type, position);
    finalOrder = maxOrder + 1;
  }

  const media = await repo.create({
    type,
    position,
    order: finalOrder,
    ...rest,
  });

  return transformMedia(media);
};

export const updateMedia = async (id: string, input: UpdateMediaInput) => {
  const existingMedia = await getMediaById(id);

  if (input.imagePath && existingMedia.thumbnail) {
    const oldImagePath = (existingMedia as any).imagePath;
    await deleteOldMediaImage(oldImagePath);
  }

  const media = await repo.update(id, input);
  return transformMedia(media);
};

export const deleteMedia = async (id: string) => {
  const media = await getMediaById(id);

  if (media.thumbnail) {
    const imagePath = (media as any).imagePath;
    await deleteOldMediaImage(imagePath);
  }

  return repo.remove(id);
};

export const reorderMedia = async (input: ReorderMediaInput) => {
  const { mediaId, newOrder } = input;

  const media = await repo.findById(mediaId);
  if (!media) {
    const error: any = new Error("Không tìm thấy media");
    error.statusCode = 404;
    throw error;
  }

  const siblings = await repo.findSiblings(media.type, media.position);

  if (newOrder < 0 || newOrder >= siblings.length) {
    const error: any = new Error("Vị trí không hợp lệ");
    error.statusCode = 400;
    throw error;
  }

  const updates = siblings
    .filter((s) => s.id !== mediaId)
    .map((sibling, index) => {
      const pos = index >= newOrder ? index + 1 : index;
      return prisma.image_media.update({
        where: { id: sibling.id },
        data: { order: pos },
      });
    });

  updates.push(
    prisma.image_media.update({
      where: { id: mediaId },
      data: { order: newOrder },
    }),
  );

  await prisma.$transaction(updates);

  return { message: "Sắp xếp thành công" };
};
