import { BlogCard, BlogDetail, Author } from "./blog.types";

// Fix BigInt serialization
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

//  Helpers

const transformAuthor = (author: any): Author => ({
  id: author.id,
  fullName: author.fullName ?? undefined,
  email: author.email,
  avatarImage: author.avatarImage ?? undefined,
});

/**
 * Strip HTML tags và cắt excerpt tại word boundary
 */
const extractExcerpt = (content: string, maxLength = 200): string => {
  const stripped = content.replace(/<[^>]*>/g, "");
  if (stripped.length <= maxLength) return stripped;

  const cut = stripped.substring(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.substring(0, lastSpace) : cut) + "...";
};

//  Transformers

/**
 * BlogCard — dùng cho list view (public & admin)
 * Admin response sẽ có thêm deletedAt/deletedBy nếu includeDeleted
 */
export const transformBlogCard = (blog: any): BlogCard => ({
  id: blog.id,
  title: blog.title,
  slug: blog.slug,
  thumbnail: blog.imageUrl ?? undefined,
  excerpt: extractExcerpt(blog.content),
  viewCount: blog.viewCount,
  status: blog.status,
  author: transformAuthor(blog.author),
  createdAt: blog.createdAt,
  publishedAt: blog.publishedAt ?? undefined,
  // Soft delete metadata — chỉ có khi admin query với select admin
  ...(blog.deletedAt !== undefined && { deletedAt: blog.deletedAt ?? undefined }),
  ...(blog.deletedBy !== undefined && { deletedBy: blog.deletedBy ?? undefined }),
});

/**
 * BlogDetail — dùng cho single blog view
 */
export const transformBlogDetail = (blog: any): BlogDetail => ({
  id: blog.id,
  title: blog.title,
  slug: blog.slug,
  content: blog.content,
  thumbnail: blog.imageUrl ?? undefined,
  viewCount: blog.viewCount,
  status: blog.status,
  author: transformAuthor(blog.author),
  createdAt: blog.createdAt,
  updatedAt: blog.updatedAt,
  publishedAt: blog.publishedAt ?? undefined,
  // Soft delete metadata
  ...(blog.deletedAt !== undefined && { deletedAt: blog.deletedAt ?? undefined }),
  ...(blog.deletedBy !== undefined && { deletedBy: blog.deletedBy ?? undefined }),
});

/**
 * Lấy imagePath từ raw blog để delete ảnh cũ trên Cloudinary
 * (imagePath không expose ra ngoài response)
 */
export const extractImagePath = (blog: any): string | undefined => {
  return blog.imagePath ?? undefined;
};
