import * as repo from "./media.repository";
import { transformMedia, transformMediaList } from "./media.transformers";
import { CreateMediaInput, UpdateMediaInput, ReorderMediaInput } from "./media.validation";
import { MediaType, MediaPosition, MediaByCategoryQuery } from "./media.types";
import { deleteOldMediaImage } from "./media.helpers";
import { NotFoundError, BadRequestError } from "@/errors";
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

  return transformedMedia.reduce(
    (acc, item) => {
      if (!acc[item.position]) acc[item.position] = [];
      acc[item.position].push(item);
      return acc;
    },
    {} as Record<string, typeof transformedMedia>,
  );
};

export const getAllMedia = async () => {
  const media = await repo.findAll(false);
  return transformMediaList(media);
};

export const getMediaById = async (id: string) => {
  const media = await repo.findById(id);
  if (!media) throw new NotFoundError("Media");
  return transformMedia(media);
};

export const createMedia = async (input: CreateMediaInput) => {
  const { type, position, order, ...rest } = input;
  const finalOrder = order ?? (await repo.getMaxOrder(type, position)) + 1;

  const media = await repo.create({ type, position, order: finalOrder, ...rest });
  return transformMedia(media);
};

export const updateMedia = async (id: string, input: UpdateMediaInput) => {
  const existingMedia = await getMediaById(id);

  if (input.imagePath && existingMedia.imageUrl) {
    await deleteOldMediaImage((existingMedia as any).imagePath);
  }

  const media = await repo.update(id, input);
  return transformMedia(media);
};

export const deleteMedia = async (id: string) => {
  const media = await getMediaById(id);

  if (media.imageUrl) {
    await deleteOldMediaImage((media as any).imagePath);
  }

  return repo.remove(id);
};

export const reorderMedia = async (input: ReorderMediaInput) => {
  const { mediaId, newOrder } = input;

  const media = await repo.findById(mediaId);
  if (!media) throw new NotFoundError("Media");

  const siblings = await repo.findSiblings(media.type, media.position);

  if (newOrder < 0 || newOrder >= siblings.length) {
    throw new BadRequestError("Vị trí không hợp lệ");
  }

  const updates = siblings
    .filter((s) => s.id !== mediaId)
    .map((sibling, index) => {
      const pos = index >= newOrder ? index + 1 : index;
      return prisma.image_media.update({ where: { id: sibling.id }, data: { order: pos } });
    });

  updates.push(prisma.image_media.update({ where: { id: mediaId }, data: { order: newOrder } }));

  await prisma.$transaction(updates);
  return { message: "Sắp xếp thành công" };
};

export const getMediaByCategorySlug = async ({ categorySlug, type }: MediaByCategoryQuery) => {
  const media = await repo.findByCategorySlug(categorySlug, type);
  return transformMediaList(media);
};
