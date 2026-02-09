import { Media } from "./media.types";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export const transformMedia = (media: any): Media => {
  return {
    id: media.id,
    type: media.type,
    position: media.position,
    title: media.title || undefined,
    thumbnail: media.imageUrl || undefined,
    linkUrl: media.linkUrl || undefined,
    order: media.order,
    isActive: media.isActive,
    createdAt: media.createdAt,
    updatedAt: media.updatedAt,
  };
};

export const transformMediaList = (mediaList: any[]): Media[] => {
  return mediaList.map(transformMedia);
};
