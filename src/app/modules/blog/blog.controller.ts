import { Request, Response } from "express";
import * as blogService from "./blog.service";
import { ListBlogsQuery } from "./blog.validation";
import { BlogStatus } from "./blog.types";
import { parseMultipartData, uploadThumbnail } from "./blog.helpers";
import { cleanupFile } from "@/services/file-cleanup.service";

type ValidatedQuery<T> = Request & {
  query: T;
};

export const getBlogsPublicHandler = async (req: ValidatedQuery<ListBlogsQuery>, res: Response) => {
  try {
    const result = await blogService.getBlogsPublic(req.query);

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

export const getBlogBySlugHandler = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const blog = await blogService.getBlogBySlug(slug);

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

export const getBlogsAdminHandler = async (req: ValidatedQuery<ListBlogsQuery>, res: Response) => {
  try {
    const result = await blogService.getBlogsAdmin(req.query);

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

export const getBlogDetailHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const blog = await blogService.getBlogById(id);

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

export const createBlogHandler = async (req: Request, res: Response) => {
  const file = req.file;

  // console.log(file);

  try {
    const parsedBody = parseMultipartData(req.body);
    const authorId = (req as any).user.id;

    let thumbnail = null;
    if (file) {
      thumbnail = await uploadThumbnail(file);
    }

    // console.log(thumbnail);

    const blog = await blogService.createBlog(authorId, {
      ...parsedBody,
      imageUrl: thumbnail?.url,
      imagePath: thumbnail?.publicId,
    });

    cleanupFile(file);

    res.status(201).json({
      success: true,
      data: blog,
      message: "Tạo bài viết thành công",
    });
  } catch (error: any) {
    cleanupFile(file);

    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: error.errors,
      });
    }

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const updateBlogHandler = async (req: Request, res: Response) => {
  const file = req.file;

  try {
    const { id } = req.params;
    const parsedBody = parseMultipartData(req.body);

    let thumbnail = null;
    if (file) {
      thumbnail = await uploadThumbnail(file);
    }

    const updateData = {
      ...parsedBody,
      ...(thumbnail && {
        imageUrl: thumbnail.url,
        imagePath: thumbnail.publicId,
      }),
    };

    const blog = await blogService.updateBlog(id, updateData);

    cleanupFile(file);

    res.json({
      success: true,
      data: blog,
      message: "Cập nhật bài viết thành công",
    });
  } catch (error: any) {
    cleanupFile(file);

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

export const deleteBlogHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await blogService.deleteBlog(id);

    res.json({
      success: true,
      message: "Xóa bài viết thành công",
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    res.status(status).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};

export const bulkUpdateBlogStatusHandler = async (req: Request, res: Response) => {
  try {
    const { blogIds, status } = req.body;

    if (!blogIds || !Array.isArray(blogIds) || blogIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Danh sách blog IDs không hợp lệ",
      });
    }

    if (!Object.values(BlogStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    await blogService.bulkUpdateBlogStatus(blogIds, status);

    res.json({
      success: true,
      message: "Cập nhật trạng thái thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server",
    });
  }
};
