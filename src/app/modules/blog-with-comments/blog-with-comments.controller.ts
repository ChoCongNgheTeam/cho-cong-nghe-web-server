import { Request, Response } from "express";
import * as orchestrator from "./index";
import { ListBlogsQuery } from "../blog/blog.validation";

type ValidatedQuery<T> = Request & {
  query: T;
};

// =====================
// === PUBLIC HANDLERS ===
// =====================

/**
 * Get blogs with comments count (public)
 * GET /api/blogs-with-comments
 */
export const getBlogsWithCommentsHandler = async (
  req: ValidatedQuery<ListBlogsQuery>,
  res: Response,
) => {
  try {
    const result = await orchestrator.getBlogsWithCommentsCount(req.query);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
      message: "Lấy danh sách bài viết thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Get blog with comments (public)
 * GET /api/blogs-with-comments/:slug
 */
export const getBlogWithCommentsHandler = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    // Parse comments pagination from query
    const commentsPage = req.query.commentsPage ? parseInt(req.query.commentsPage as string) : 1;
    const commentsLimit = req.query.commentsLimit
      ? parseInt(req.query.commentsLimit as string)
      : 20;
    const includeReplies = req.query.includeReplies !== "false"; // default true

    const blog = await orchestrator.getBlogWithComments(slug, {
      commentsPage,
      commentsLimit,
      includeReplies,
    });

    res.json({
      success: true,
      data: blog,
      message: "Lấy chi tiết bài viết thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

// =====================
// === ADMIN HANDLERS ===
// =====================

/**
 * Get blogs with comments count (admin)
 * GET /api/blogs-with-comments/admin/all
 */
export const getBlogsWithCommentsAdminHandler = async (
  req: ValidatedQuery<ListBlogsQuery>,
  res: Response,
) => {
  try {
    const result = await orchestrator.getBlogsWithCommentsCountAdmin(req.query);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
      message: "Lấy danh sách bài viết thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Get blog with all comments (admin)
 * GET /api/blogs-with-comments/admin/:id
 */
export const getBlogWithCommentsAdminHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const commentsPage = req.query.commentsPage ? parseInt(req.query.commentsPage as string) : 1;
    const commentsLimit = req.query.commentsLimit
      ? parseInt(req.query.commentsLimit as string)
      : 20;

    const blog = await orchestrator.getBlogWithCommentsAdmin(id, {
      commentsPage,
      commentsLimit,
    });

    res.json({
      success: true,
      data: blog,
      message: "Lấy chi tiết bài viết thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};
