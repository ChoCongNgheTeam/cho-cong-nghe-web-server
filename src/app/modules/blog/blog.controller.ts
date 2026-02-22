import { Request, Response } from "express";
import * as blogService from "./blog.service";
import { ListBlogsQuery } from "./blog.validation";
import { parseMultipartData, uploadThumbnail } from "./blog.helpers";
import { cleanupFile } from "@/services/file-cleanup.service";

export const getBlogsPublicHandler = async (req: Request, res: Response) => {
  const result = await blogService.getBlogsPublic(req.query as unknown as ListBlogsQuery);
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

export const getBlogsAdminHandler = async (req: Request, res: Response) => {
  const result = await blogService.getBlogsAdmin(req.query as unknown as ListBlogsQuery);

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
  const blog = await blogService.getBlogById(req.params.id);
  res.json({ data: blog, message: "Lấy chi tiết bài viết thành công" });
};

export const createBlogHandler = async (req: Request, res: Response) => {
  const file = req.file;

  try {
    const parsedBody = parseMultipartData(req.body);
    const authorId = req.user!.id;

    const thumbnail = file ? await uploadThumbnail(file) : null;

    const blog = await blogService.createBlog(authorId, {
      ...parsedBody,
      imageUrl: thumbnail?.url,
      imagePath: thumbnail?.publicId,
    });

    res.status(201).json({ data: blog, message: "Tạo bài viết thành công" });
  } finally {
    // Luôn cleanup file tạm dù thành công hay lỗi
    cleanupFile(file);
  }
};

export const updateBlogHandler = async (req: Request, res: Response) => {
  const file = req.file;

  try {
    const parsedBody = parseMultipartData(req.body);
    const thumbnail = file ? await uploadThumbnail(file) : null;

    const updateData = {
      ...parsedBody,
      ...(thumbnail && {
        imageUrl: thumbnail.url,
        imagePath: thumbnail.publicId,
      }),
    };

    const blog = await blogService.updateBlog(req.params.id, updateData);

    res.json({ data: blog, message: "Cập nhật bài viết thành công" });
  } finally {
    cleanupFile(file);
  }
};

export const deleteBlogHandler = async (req: Request, res: Response) => {
  await blogService.deleteBlog(req.params.id);
  res.json({ message: "Xóa bài viết thành công" });
};

export const bulkUpdateBlogStatusHandler = async (req: Request, res: Response) => {
  const { blogIds, status } = req.body;
  await blogService.bulkUpdateBlogStatus(blogIds, status);
  res.json({ message: "Cập nhật trạng thái thành công" });
};
