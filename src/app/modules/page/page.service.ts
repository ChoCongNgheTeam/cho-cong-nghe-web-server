import * as pageRepository from "./page.repository";
import { NotFoundError } from "@/errors";
import { ListPagesQuery } from "./page.validation";
import { BadRequestError } from "@/errors";
import { AdminListPagesQuery, CreatePageInput, UpdatePageInput } from "./page.validation";

export const getPageBySlugPublic = async (slug: string) => {
  const page = await pageRepository.findBySlugPublic(slug);
  
  if (!page) {
    throw new NotFoundError("Trang tĩnh hoặc chính sách");
  }

  return page;
};
export const getPagesPublic = async (query: ListPagesQuery) => {
  return pageRepository.findAllPublic(query);
};

export const getPagesAdmin = async (query: AdminListPagesQuery) => {
  return pageRepository.findAllAdmin(query);
};

export const getPageDetailAdmin = async (id: string) => {
  const page = await pageRepository.findById(id);
  if (!page) throw new NotFoundError("Trang tĩnh");
  return page;
};

export const createPage = async (data: CreatePageInput) => {
  const isSlugExist = await pageRepository.checkSlugExists(data.slug);
  if (isSlugExist) throw new BadRequestError("Đường dẫn (slug) này đã tồn tại, vui lòng chọn tên khác");
  return pageRepository.create(data);
};

export const updatePage = async (id: string, data: UpdatePageInput) => {
  await getPageDetailAdmin(id); // Check tồn tại
  if (data.slug) {
    const isSlugExist = await pageRepository.checkSlugExists(data.slug, id);
    if (isSlugExist) throw new BadRequestError("Đường dẫn (slug) này đã tồn tại");
  }
  return pageRepository.update(id, data);
};

export const softDeletePage = async (id: string, userId: string) => {
  await getPageDetailAdmin(id); // Check tồn tại
  return pageRepository.softDelete(id, userId);
};

// BỔ SUNG: Các hàm Service mới
export const getTrashAdmin = async (query: AdminListPagesQuery) => {
  return pageRepository.findTrashAdmin(query);
};

export const restorePage = async (id: string) => {
  const page = await pageRepository.findByIdWithTrash(id);
  if (!page || !page.deletedAt) throw new BadRequestError("Trang không tồn tại trong thùng rác");
  return pageRepository.restore(id);
};

export const hardDeletePage = async (id: string) => {
  const page = await pageRepository.findByIdWithTrash(id);
  if (!page || !page.deletedAt) throw new BadRequestError("Trang không tồn tại trong thùng rác");
  return pageRepository.hardDelete(id);
};

export const changePageStatus = async (id: string, isPublished: boolean) => {
  await getPageDetailAdmin(id); // Dùng lại hàm cũ để check trang có tồn tại và chưa bị xóa mềm ko
  return pageRepository.changeStatus(id, isPublished);
};