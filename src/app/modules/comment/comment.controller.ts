import { Request, Response } from "express";
import * as commentService from "./comment.service";
import { ListCommentsQuery } from "./comment.validation";

type ValidatedQuery<T> = Request & {
  query: T;
};

// =====================
// === PUBLIC HANDLERS ===
// =====================

/**
 * Get approved comments (public)
 */
export const getCommentsPublicHandler = async (
  req: ValidatedQuery<ListCommentsQuery>,
  res: Response,
) => {
  try {
    const result = await commentService.getCommentsPublic(req.query);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
      message: "Lấy danh sách comment thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Get replies for a comment (public)
 */
export const getCommentRepliesHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const replies = await commentService.getCommentReplies(id);

    res.json({
      success: true,
      data: replies,
      message: "Lấy replies thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Create comment (authenticated user)
 */
export const createCommentHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const comment = await commentService.createComment(userId, req.body);

    res.status(201).json({
      success: true,
      data: comment,
      message: "Tạo comment thành công. Chờ duyệt.",
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: error.errors,
      });
    }

    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Delete own comment (authenticated user)
 */
export const deleteOwnCommentHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    await commentService.deleteOwnComment(id, userId);

    res.json({
      success: true,
      message: "Xóa comment thành công",
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
 * Get all comments (admin - includes not approved)
 */
export const getCommentsAdminHandler = async (
  req: ValidatedQuery<ListCommentsQuery>,
  res: Response,
) => {
  try {
    const result = await commentService.getCommentsAdmin(req.query);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
      message: "Lấy danh sách comment thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Get comment by ID (admin)
 */
export const getCommentDetailHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const comment = await commentService.getCommentById(id);

    res.json({
      success: true,
      data: comment,
      message: "Lấy chi tiết comment thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Update comment (admin)
 */
export const updateCommentHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const comment = await commentService.updateComment(id, req.body);

    res.json({
      success: true,
      data: comment,
      message: "Cập nhật comment thành công",
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: error.errors,
      });
    }

    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Approve/Reject comment (admin)
 */
export const approveCommentHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const comment = await commentService.updateCommentApproval(id, isApproved);

    res.json({
      success: true,
      data: comment,
      message: isApproved ? "Duyệt comment thành công" : "Từ chối comment thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Delete comment (admin)
 */
export const deleteCommentHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await commentService.deleteComment(id);

    res.json({
      success: true,
      message: "Xóa comment thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

/**
 * Bulk approve/reject comments (admin)
 */
export const bulkApproveCommentsHandler = async (req: Request, res: Response) => {
  try {
    const { commentIds, isApproved } = req.body;

    if (!commentIds || !Array.isArray(commentIds) || commentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Danh sách comment IDs không hợp lệ",
      });
    }

    if (typeof isApproved !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isApproved phải là boolean",
      });
    }

    await commentService.bulkApproveComments(commentIds, isApproved);

    res.json({
      success: true,
      message: isApproved ? "Duyệt comments thành công" : "Từ chối comments thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};
