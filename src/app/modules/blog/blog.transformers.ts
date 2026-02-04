import { BlogCard, BlogDetail, Author, RawBlog } from "./blog.types";

// Fix BigInt serialization
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

/**
 * Transform author data
 */
const transformAuthor = (author: any): Author => ({
  id: author.id,
  fullName: author.fullName || undefined,
  email: author.email,
  avatarImage: author.avatarImage || undefined,
});

/**
 * Extract excerpt from content (first 200 chars, strip HTML if any)
 */
const extractExcerpt = (content: string, maxLength: number = 200): string => {
  // Strip HTML tags (basic)
  const strippedContent = content.replace(/<[^>]*>/g, "");

  if (strippedContent.length <= maxLength) {
    return strippedContent;
  }

  // Cut at word boundary
  const excerpt = strippedContent.substring(0, maxLength);
  const lastSpace = excerpt.lastIndexOf(" ");

  return lastSpace > 0 ? excerpt.substring(0, lastSpace) + "..." : excerpt + "...";
};

/**
 * Transform blog card for list display
 */
export const transformBlogCard = (blog: any): BlogCard => {
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    imageUrl: blog.imageUrl || undefined,
    excerpt: extractExcerpt(blog.content),
    viewCount: blog.viewCount,
    status: blog.status,
    author: transformAuthor(blog.author),
    createdAt: blog.createdAt,
    publishedAt: blog.publishedAt || undefined,
    // commentsCount will be added by orchestrator if needed
  };
};

/**
 * Transform blog detail
 */
export const transformBlogDetail = (blog: any): BlogDetail => {
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    content: blog.content,
    thumbnail: blog.thumbnail || undefined,
    viewCount: blog.viewCount,
    status: blog.status,
    author: transformAuthor(blog.author),
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
    publishedAt: blog.publishedAt || undefined,
    // comments and commentsCount will be added by orchestrator
  };
};
