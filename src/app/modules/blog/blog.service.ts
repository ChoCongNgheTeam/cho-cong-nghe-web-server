import { slugify } from "transliteration";
import * as repo from "./blog.repository";
import { transformBlogCard, transformBlogDetail } from "./blog.transformers";
import { CreateBlogInput, UpdateBlogInput, ListBlogsQuery, BlogStatus } from "./blog.validation";
import { deleteOldThumbnail } from "./blog.helpers";
import { NotFoundError } from "@/errors";

export const getBlogsPublic = async (query: ListBlogsQuery) => {
  const result = await repo.findAllPublic(query);
  return { ...result, data: result.data.map(transformBlogCard) };
};

export const getBlogBySlug = async (slug: string) => {
  const blog = await repo.findBySlug(slug);

  if (!blog || blog.status !== BlogStatus.PUBLISHED) {
    throw new NotFoundError("Bài viết");
  }

  // Fire-and-forget: không block response
  repo.incrementViewCount(blog.id).catch(console.error);

  return transformBlogDetail(blog);
};

export const getBlogsAdmin = async (query: ListBlogsQuery) => {
  const result = await repo.findAllAdmin(query);
  return { ...result, data: result.data.map(transformBlogCard) };
};

export const getBlogById = async (id: string) => {
  const blog = await repo.findById(id);

  if (!blog) throw new NotFoundError("Bài viết");

  return transformBlogDetail(blog);
};

export const createBlog = async (authorId: string, input: CreateBlogInput) => {
  const slug = await generateUniqueSlug(input.title);

  const publishedAt = input.status === BlogStatus.PUBLISHED && !input.publishedAt ? new Date() : input.publishedAt;

  const blog = await repo.create(authorId, { ...input, slug, publishedAt });

  return transformBlogDetail(blog);
};

export const updateBlog = async (id: string, input: UpdateBlogInput) => {
  const existingBlog = await getBlogById(id);
  const updateData: any = { ...input };

  if (input.title) {
    updateData.slug = await generateUniqueSlug(input.title, id);
  }

  if (input.status === BlogStatus.PUBLISHED && existingBlog.status !== BlogStatus.PUBLISHED && !input.publishedAt) {
    updateData.publishedAt = new Date();
  }

  if (input.status === BlogStatus.DRAFT && existingBlog.status === BlogStatus.PUBLISHED) {
    updateData.publishedAt = null;
  }

  if (input.imagePath && existingBlog.thumbnail) {
    await deleteOldThumbnail((existingBlog as any).imagePath);
  }

  const blog = await repo.update(id, updateData);
  return transformBlogDetail(blog);
};

export const deleteBlog = async (id: string) => {
  const blog = await getBlogById(id);

  if (blog.thumbnail) {
    await deleteOldThumbnail((blog as any).imagePath);
  }

  return repo.remove(id);
};

export const bulkUpdateBlogStatus = async (blogIds: string[], status: BlogStatus) => {
  const updateData: any = { status };

  if (status === BlogStatus.PUBLISHED) updateData.publishedAt = new Date();
  if (status === BlogStatus.DRAFT) updateData.publishedAt = null;

  return repo.bulkUpdate(blogIds, updateData);
};

// Helpers nội bộ

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
