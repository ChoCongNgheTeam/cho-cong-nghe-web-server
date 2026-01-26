import { slugify } from "transliteration";
import * as repo from "./blog.repository";
import { transformBlogCard, transformBlogDetail } from "./blog.transformers";
import { CreateBlogInput, UpdateBlogInput, ListBlogsQuery, BlogStatus } from "./blog.validation";

// =====================
// === PUBLIC SERVICES ===
// =====================

/**
 * Get published blogs (public)
 */
export const getBlogsPublic = async (query: ListBlogsQuery) => {
  const result = await repo.findAllPublic(query);

  return {
    ...result,
    data: result.data.map(transformBlogCard),
  };
};

/**
 * Get blog by slug (public)
 * Only returns published blogs
 */
export const getBlogBySlug = async (slug: string) => {
  const blog = await repo.findBySlug(slug);

  if (!blog || blog.status !== BlogStatus.PUBLISHED) {
    const error: any = new Error("Không tìm thấy bài viết");
    error.statusCode = 404;
    throw error;
  }

  // Increment view count async (don't wait)
  repo.incrementViewCount(blog.id).catch(console.error);

  return transformBlogDetail(blog);
};

// =====================
// === ADMIN SERVICES ===
// =====================

/**
 * Get all blogs (admin - includes drafts and archived)
 */
export const getBlogsAdmin = async (query: ListBlogsQuery) => {
  const result = await repo.findAllAdmin(query);

  return {
    ...result,
    data: result.data.map(transformBlogCard),
  };
};

/**
 * Get blog by ID (admin)
 */
export const getBlogById = async (id: string) => {
  const blog = await repo.findById(id);

  if (!blog) {
    const error: any = new Error("Không tìm thấy bài viết");
    error.statusCode = 404;
    throw error;
  }

  return transformBlogDetail(blog);
};

/**
 * Create blog (admin/author)
 */
export const createBlog = async (authorId: string, input: CreateBlogInput) => {
  // Generate slug from title
  const baseSlug = slugify(input.title).toLowerCase();
  let slug = baseSlug;
  let counter = 1;

  // Ensure unique slug
  while (await repo.checkSlugExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Auto set publishedAt if status is PUBLISHED and not provided
  const publishedAt =
    input.status === BlogStatus.PUBLISHED && !input.publishedAt ? new Date() : input.publishedAt;

  const blog = await repo.create(authorId, {
    ...input,
    slug,
    publishedAt,
  });

  return transformBlogDetail(blog);
};

/**
 * Update blog (admin/author)
 */
export const updateBlog = async (id: string, input: UpdateBlogInput) => {
  // Check if blog exists
  const existingBlog = await getBlogById(id);

  const updateData: any = { ...input };

  // Update slug if title changed
  if (input.title) {
    const baseSlug = slugify(input.title).toLowerCase();
    let slug = baseSlug;
    let counter = 1;

    // Ensure unique slug (excluding current blog)
    while (await repo.checkSlugExists(slug, id)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    updateData.slug = slug;
  }

  // Auto set publishedAt if status changes to PUBLISHED
  if (
    input.status === BlogStatus.PUBLISHED &&
    existingBlog.status !== BlogStatus.PUBLISHED &&
    !input.publishedAt
  ) {
    updateData.publishedAt = new Date();
  }

  // Clear publishedAt if status changes from PUBLISHED to DRAFT
  if (input.status === BlogStatus.DRAFT && existingBlog.status === BlogStatus.PUBLISHED) {
    updateData.publishedAt = null;
  }

  const blog = await repo.update(id, updateData);
  return transformBlogDetail(blog);
};

/**
 * Delete blog (admin)
 */
export const deleteBlog = async (id: string) => {
  // Check if blog exists
  await getBlogById(id);

  return repo.remove(id);
};

/**
 * Bulk update blog status (admin)
 */
export const bulkUpdateBlogStatus = async (blogIds: string[], status: BlogStatus) => {
  const updateData: any = { status };

  // Set publishedAt if changing to PUBLISHED
  if (status === BlogStatus.PUBLISHED) {
    updateData.publishedAt = new Date();
  }

  // Clear publishedAt if changing to DRAFT
  if (status === BlogStatus.DRAFT) {
    updateData.publishedAt = null;
  }

  return repo.bulkUpdate(blogIds, updateData);
};
