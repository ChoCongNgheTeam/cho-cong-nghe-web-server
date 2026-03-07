/**
 * Blog-with-Comments Orchestrator
 *
 * Kết hợp Blog Module và Comment Module
 * Tương tự như Pricing Orchestrator trong Product Module
 */

import * as blogService from "../blog/blog.service";
import * as commentService from "../comment/comment.service";
import { ListBlogsQuery } from "../blog/blog.validation";
import { CommentTargetType } from "../comment/comment.types";

// =====================
// === PUBLIC FUNCTIONS ===
// =====================

/**
 * Get blogs with comments count
 * For blog list pages
 */
export const getBlogsWithCommentsCount = async (query: ListBlogsQuery) => {
  // 1. Get blogs from blog service
  const result = await blogService.getBlogsPublic(query);

  // 2. Get blog IDs
  const blogIds = result.data.map((blog) => blog.id);

  if (blogIds.length === 0) {
    return result;
  }

  // 3. Get comments count for each blog
  const commentsCountMap = await commentService.getCommentsCountByTargets(
    CommentTargetType.BLOG,
    blogIds,
  );

  // 4. Merge data
  const dataWithComments = result.data.map((blog) => ({
    ...blog,
    commentsCount: commentsCountMap.get(blog.id) || 0,
  }));

  return {
    ...result,
    data: dataWithComments,
  };
};

/**
 * Get blog detail with comments
 * For blog detail page
 */
export const getBlogWithComments = async (
  slug: string,
  options: {
    commentsPage?: number;
    commentsLimit?: number;
    includeReplies?: boolean;
  } = {},
) => {
  const { commentsPage = 1, commentsLimit = 20, includeReplies = true } = options;

  // 1. Get blog detail
  const blog = await blogService.getBlogBySlug(slug);

  // 2. Get comments for this blog
  const comments = await commentService.getCommentsByTarget(CommentTargetType.BLOG, blog.id, {
    page: commentsPage,
    limit: commentsLimit,
    includeReplies,
  });

  // 3. Merge data
  return {
    ...blog,
    comments: comments.data,
    commentsCount: comments.total,
    commentsPagination: {
      page: comments.page,
      limit: comments.limit,
      total: comments.total,
      totalPages: comments.totalPages,
    },
  };
};

// =====================
// === ADMIN FUNCTIONS ===
// =====================

/**
 * Get blogs with comments count (admin)
 * Includes drafts and archived
 */
export const getBlogsWithCommentsCountAdmin = async (query: ListBlogsQuery) => {
  // 1. Get blogs from blog service (admin)
  const result = await blogService.getBlogsAdmin(query);

  // 2. Get blog IDs
  const blogIds = result.data.map((blog) => blog.id);

  if (blogIds.length === 0) {
    return result;
  }

  // 3. Get comments count for each blog (including not approved)
  const commentsCountMap = await commentService.getCommentsCountByTargets(
    CommentTargetType.BLOG,
    blogIds,
  );

  // 4. Merge data
  const dataWithComments = result.data.map((blog) => ({
    ...blog,
    commentsCount: commentsCountMap.get(blog.id) || 0,
  }));

  return {
    ...result,
    data: dataWithComments,
  };
};

/**
 * Get blog detail with all comments (admin)
 * Includes not approved comments
 */
export const getBlogWithCommentsAdmin = async (
  id: string,
  options: {
    commentsPage?: number;
    commentsLimit?: number;
  } = {},
) => {
  const { commentsPage = 1, commentsLimit = 20 } = options;

  // 1. Get blog detail (admin)
  const blog = await blogService.getBlogById(id);

  // 2. Get all comments for this blog (admin - includes not approved)
  const commentsQuery = {
    page: commentsPage,
    limit: commentsLimit,
    targetType: CommentTargetType.BLOG,
    targetId: blog.id,
    sortBy: "createdAt" as const,
    sortOrder: "desc" as const,
  };

  const comments = await commentService.getCommentsAdmin(commentsQuery);

  // 3. Merge data
  return {
    ...blog,
    comments: comments.data,
    commentsCount: comments.total,
    commentsPagination: {
      page: comments.page,
      limit: comments.limit,
      total: comments.total,
      totalPages: comments.totalPages,
    },
  };
};
