import { slugify } from "transliteration";
import * as repo from "./blog.repository";
import { transformBlogCard, transformBlogDetail, extractImagePath } from "./blog.transformers";
import { CreateBlogInput, UpdateBlogInput, ListBlogsQuery, ListDeletedBlogsQuery, BlogStatus } from "./blog.validation";
import { deleteOldThumbnail } from "./blog.helpers";
import { NotFoundError, ForbiddenError, BadRequestError } from "@/errors";

//  Helper

const assertBlogExists = async (id: string, options: { includeDeleted?: boolean; isAdmin?: boolean } = {}) => {
  const blog = await repo.findById(id, options);
  if (!blog) throw new NotFoundError("Bài viết");
  return blog;
};

const generateUniqueSlug = async (title: string, excludeId?: string): Promise<string> => {
  const baseSlug = slugify(title).toLowerCase();
  let slug = baseSlug;
  let counter = 1;

  while (await repo.checkSlugExists(slug, excludeId)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

//  Public

export const getBlogsPublic = async (query: ListBlogsQuery) => {
  const result = await repo.findAllPublic(query);
  return { ...result, data: result.data.map(transformBlogCard) };
};

export const getBlogBySlug = async (slug: string) => {
  const blog = await repo.findBySlug(slug);

  if (!blog || blog.status !== BlogStatus.PUBLISHED) {
    throw new NotFoundError("Bài viết");
  }

  repo.incrementViewCount(blog.id).catch(console.error);

  return transformBlogDetail(blog);
};

//  Admin & Staff: list, detail

export const getBlogsAdmin = async (query: ListBlogsQuery) => {
  const result = await repo.findAllAdmin(query);
  return { ...result, data: result.data.map(transformBlogCard) };
};

export const getBlogById = async (id: string, options: { includeDeleted?: boolean; isAdmin?: boolean } = {}) => {
  const blog = await assertBlogExists(id, options);
  return transformBlogDetail(blog);
};

/**
 * Lấy danh sách tác giả có blog — dùng cho filter dropdown FE
 */
export const getBlogAuthors = async () => {
  return repo.findBlogAuthors();
};

//  Admin & Staff: create, update

export const createBlog = async (authorId: string, input: CreateBlogInput) => {
  const slug = await generateUniqueSlug(input.title);

  const publishedAt = input.status === BlogStatus.PUBLISHED && !input.publishedAt ? new Date() : input.publishedAt;

  const blog = await repo.create(authorId, { ...input, slug, publishedAt });
  return transformBlogDetail(blog);
};

export const updateBlog = async (id: string, input: UpdateBlogInput) => {
  const existingRaw = await repo.findById(id);
  if (!existingRaw) throw new NotFoundError("Bài viết");

  const existingBlog = transformBlogDetail(existingRaw);
  const updateData: Record<string, any> = { ...input };

  if (input.title) {
    updateData.slug = await generateUniqueSlug(input.title, id);
  }

  if (input.status === BlogStatus.PUBLISHED && existingBlog.status !== BlogStatus.PUBLISHED && !input.publishedAt) {
    updateData.publishedAt = new Date();
  }

  if (input.status === BlogStatus.DRAFT && existingBlog.status === BlogStatus.PUBLISHED) {
    updateData.publishedAt = null;
  }

  if (input.imagePath) {
    const oldImagePath = extractImagePath(existingRaw);
    if (oldImagePath) await deleteOldThumbnail(oldImagePath);
  }

  const blog = await repo.update(id, updateData);
  return transformBlogDetail(blog);
};

//  Soft delete — Staff & Admin

export const softDeleteBlog = async (id: string, deletedById: string) => {
  await assertBlogExists(id);
  return repo.softDelete(id, deletedById);
};

export const bulkSoftDeleteBlogs = async (ids: string[], deletedById: string) => {
  return repo.bulkSoftDelete(ids, deletedById);
};

//  Admin only: restore, hard delete, trash

export const restoreBlog = async (id: string) => {
  const blog = (await repo.findById(id, { includeDeleted: true, isAdmin: true })) as any;
  if (!blog) throw new NotFoundError("Bài viết");
  if (!blog.deletedAt) throw new BadRequestError("Bài viết này chưa bị xóa");

  const restored = await repo.restore(id);
  return transformBlogDetail(restored);
};

export const bulkRestoreBlogs = async (ids: string[]) => {
  return repo.bulkRestore(ids);
};

export const hardDeleteBlog = async (id: string) => {
  const blog = (await repo.findById(id, { includeDeleted: true, isAdmin: true })) as any;
  if (!blog) throw new NotFoundError("Bài viết");

  if (!blog.deletedAt) {
    throw new ForbiddenError("Phải soft delete trước khi xóa vĩnh viễn. Dùng DELETE /admin/blogs/:id");
  }

  const imagePath = extractImagePath(blog);
  if (imagePath) await deleteOldThumbnail(imagePath);

  return repo.hardDelete(id);
};

/**
 * Lấy danh sách blog trong trash — hỗ trợ search + pagination
 */
export const getDeletedBlogs = async (query: ListDeletedBlogsQuery) => {
  const result = await repo.findAllDeleted(query);
  return { ...result, data: result.data.map(transformBlogCard) };
};

//  Bulk status update

export const bulkUpdateBlogStatus = async (blogIds: string[], status: BlogStatus) => {
  const updateData: Record<string, any> = { status };

  if (status === BlogStatus.PUBLISHED) updateData.publishedAt = new Date();
  if (status === BlogStatus.DRAFT) updateData.publishedAt = null;

  return repo.bulkUpdate(blogIds, updateData);
};
