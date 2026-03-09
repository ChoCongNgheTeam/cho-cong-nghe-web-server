import { Request, Response } from "express";
import * as blogService from "./blog.service";
import { ListBlogsQuery, listBlogsSchema } from "./blog.validation";
import { parseMultipartData, uploadThumbnail } from "./blog.helpers";
import { cleanupFile } from "@/services/file-cleanup.service";

//  Public

export const getBlogsPublicHandler = async (req: Request, res: Response) => {
  const query = listBlogsSchema.parse(req.query);
  const result = await blogService.getBlogsPublic(query);

  res.json({
    data: result.data,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
    message: "Lấy danh sách bài viết thành công",
  });
};

export const getBlogBySlugHandler = async (req: Request, res: Response) => {
  const blog = await blogService.getBlogBySlug(req.params.slug);
  res.json({ data: blog, message: "Lấy chi tiết bài viết thành công" });
};

//  Staff & Admin: list, detail

export const getBlogsAdminHandler = async (req: Request, res: Response) => {
  const query = listBlogsSchema.parse(req.query);
  const result = await blogService.getBlogsAdmin(query);

  res.json({
    data: result.data,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
    message: "Lấy danh sách bài viết thành công",
  });
};

export const getBlogDetailHandler = async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === "ADMIN";
  const blog = await blogService.getBlogById(req.params.id, { isAdmin });
  res.json({ data: blog, message: "Lấy chi tiết bài viết thành công" });
};

//  Staff & Admin: create, update

export const createBlogHandler = async (req: Request, res: Response) => {
  const file = req.file;

  try {
    const parsedBody = parseMultipartData(req.body);
    const authorId = req.user!.id;
    const thumbnail = file ? await uploadThumbnail(file) : null;

    const blog = await blogService.createBlog(authorId, {
      ...parsedBody,
      ...(thumbnail && { imageUrl: thumbnail.url, imagePath: thumbnail.publicId }),
    });

    res.status(201).json({ data: blog, message: "Tạo bài viết thành công" });
  } finally {
    cleanupFile(file);
  }
};

export const updateBlogHandler = async (req: Request, res: Response) => {
  const file = req.file;

  try {
    const parsedBody = parseMultipartData(req.body);
    const thumbnail = file ? await uploadThumbnail(file) : null;

    const blog = await blogService.updateBlog(req.params.id, {
      ...parsedBody,
      ...(thumbnail && { imageUrl: thumbnail.url, imagePath: thumbnail.publicId }),
    });

    res.json({ data: blog, message: "Cập nhật bài viết thành công" });
  } finally {
    cleanupFile(file);
  }
};

//  Staff & Admin: soft delete

/**
 * Soft delete — Staff & Admin
 * Blog không cần phân biệt target role như user module
 */
export const deleteBlogHandler = async (req: Request, res: Response) => {
  await blogService.softDeleteBlog(req.params.id, req.user!.id);
  res.json({ message: "Xóa bài viết thành công" });
};

export const bulkDeleteBlogsHandler = async (req: Request, res: Response) => {
  const { blogIds } = req.body;
  await blogService.bulkSoftDeleteBlogs(blogIds, req.user!.id);
  res.json({ message: "Xóa bài viết thành công" });
};

//  Admin only

export const restoreBlogHandler = async (req: Request, res: Response) => {
  const blog = await blogService.restoreBlog(req.params.id);
  res.json({ data: blog, message: "Khôi phục bài viết thành công" });
};

export const bulkRestoreBlogsHandler = async (req: Request, res: Response) => {
  const { blogIds } = req.body;
  await blogService.bulkRestoreBlogs(blogIds);
  res.json({ message: "Khôi phục bài viết thành công" });
};

export const hardDeleteBlogHandler = async (req: Request, res: Response) => {
  await blogService.hardDeleteBlog(req.params.id);
  res.json({ message: "Xóa bài viết vĩnh viễn thành công" });
};

export const getDeletedBlogsHandler = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const result = await blogService.getDeletedBlogs({ page, limit });

  res.json({
    data: result.data,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
    message: "Lấy danh sách bài viết đã xóa thành công",
  });
};

export const bulkUpdateBlogStatusHandler = async (req: Request, res: Response) => {
  const { blogIds, status } = req.body;
  await blogService.bulkUpdateBlogStatus(blogIds, status);
  res.json({ message: "Cập nhật trạng thái thành công" });
};
