import { MediaType, MediaPosition } from "@prisma/client";

export { MediaType, MediaPosition };

// export enum MediaType {
//   SLIDER = "SLIDER",
//   BANNER = "BANNER",
// }

// export enum MediaPosition {
//   HOME_TOP = "HOME_TOP",
//   BELOW_SLIDER = "BELOW_SLIDER",
//   HOME_SECTION_1 = "HOME_SECTION_1",
//   HOME_SECTION_2 = "HOME_SECTION_2",
// }

export interface Media {
  id: string;
  type: MediaType;
  position: MediaPosition;
  title: string | null;
  subTitle: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaGrouped {
  [position: string]: Media[];
}

export interface RawMedia {
  id: string;
  type: MediaType;
  position: MediaPosition;
  title: string | null;
  subTitle: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMediaInput {
  type: MediaType;
  position: MediaPosition;
  title?: string;
  subTitle?: string;
  imagePath?: string;
  imageUrl?: string;
  linkUrl?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateMediaInput {
  type?: MediaType;
  position?: MediaPosition;
  title?: string;
  subTitle?: string;
  imagePath?: string;
  imageUrl?: string;
  linkUrl?: string;
  order?: number;
  isActive?: boolean;
}

export interface ReorderMediaInput {
  mediaId: string;
  newOrder: number;
}

export interface MediaByCategoryQuery {
  categorySlug: string;
  type?: MediaType;
}
