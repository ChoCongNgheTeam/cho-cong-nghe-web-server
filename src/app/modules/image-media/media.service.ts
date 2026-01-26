import * as mediaRepository from "./media.repository";
import { CreateMediaInput, UpdateMediaInput, ReorderMediaInput } from "./media.validation";
import { NotFoundError, BadRequestError } from "@/utils/errors";
import { MediaType, MediaPosition } from "@prisma/client";
import prisma from "@/config/db";

// === PUBLIC SERVICES ===

// Lấy media theo type (SLIDER hoặc BANNER)
export const getMediaByType = async (type: MediaType) => {
  return mediaRepository.findByType(type, true);
};

// Lấy media theo position (HOME_TOP, BELOW_SLIDER, ...)
// Orchestrator sẽ dùng hàm này để lấy data cho từng section
export const getMediaByPosition = async (position: MediaPosition) => {
  return mediaRepository.findByPosition(position, true);
};

// Lấy media theo type + position (query cụ thể hơn)
export const getMediaByTypeAndPosition = async (type: MediaType, position: MediaPosition) => {
  return mediaRepository.findByTypeAndPosition(type, position, true);
};

// Lấy tất cả media active (cho Home orchestrator - 1 lần lấy hết)
export const getAllActiveMedia = async () => {
  const media = await mediaRepository.findAll(true);

  // Group by position để orchestrator dễ xử lý
  const grouped = media.reduce(
    (acc, item) => {
      if (!acc[item.position]) {
        acc[item.position] = [];
      }
      acc[item.position].push(item);
      return acc;
    },
    {} as Record<string, typeof media>,
  );

  return grouped;
};

// === ADMIN SERVICES ===

// Lấy tất cả media (admin)
export const getAllMedia = async () => {
  return mediaRepository.findAll(false);
};

// Lấy media detail (admin)
export const getMediaDetail = async (id: string) => {
  const media = await mediaRepository.findById(id);
  if (!media) {
    throw new NotFoundError("Media");
  }
  return media;
};

// Tạo media
export const createMedia = async (input: CreateMediaInput) => {
  const { type, position, order, ...rest } = input;

  // Tính order nếu không được cung cấp
  let finalOrder = order;
  if (finalOrder === undefined) {
    const maxOrder = await mediaRepository.getMaxOrder(
      type as MediaType,
      position as MediaPosition,
    );
    finalOrder = maxOrder + 1;
  }

  return mediaRepository.create({
    type: type as MediaType,
    position: position as MediaPosition,
    order: finalOrder,
    ...rest,
  });
};

// Update media
export const updateMedia = async (id: string, input: UpdateMediaInput) => {
  const media = await mediaRepository.findById(id);
  if (!media) {
    throw new NotFoundError("Media");
  }

  return mediaRepository.update(id, {
    ...(input.type && { type: input.type as MediaType }),
    ...(input.position && { position: input.position as MediaPosition }),
    ...(input.title !== undefined && { title: input.title }),
    ...(input.imagePath !== undefined && { imagePath: input.imagePath }),
    ...(input.linkUrl !== undefined && { linkUrl: input.linkUrl }),
    ...(input.order !== undefined && { order: input.order }),
    ...(input.isActive !== undefined && { isActive: input.isActive }),
  });
};

// Delete media
export const deleteMedia = async (id: string) => {
  const media = await mediaRepository.findById(id);
  if (!media) {
    throw new NotFoundError("Media");
  }

  return mediaRepository.remove(id);
};

// Reorder media (sắp xếp lại order trong cùng type + position)
export const reorderMedia = async (input: ReorderMediaInput) => {
  const { mediaId, newOrder } = input;

  const media = await mediaRepository.findById(mediaId);
  if (!media) {
    throw new NotFoundError("Media");
  }

  const siblings = await mediaRepository.findSiblings(media.type, media.position);

  if (newOrder < 0 || newOrder >= siblings.length) {
    throw new BadRequestError("Vị trí không hợp lệ");
  }

  // Reorder logic
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
