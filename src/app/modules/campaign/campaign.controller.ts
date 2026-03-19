import { Request, Response } from "express";
import { campaignService } from "./campaign.service";
import { uploadCampaignCategoryImage } from "./campaign.helpers";
import { cleanupFile } from "@/services/file-cleanup.service";
import { ListCampaignsQuery, UpdateCampaignCategoryInput, bulkDeleteCampaignsSchema } from "./campaign.validation";
import { CampaignType } from "@prisma/client";

const cleanupFiles = (files: Express.Multer.File[] | undefined) => {
  files?.forEach((file) => cleanupFile(file));
};

const getActorId = (req: Request): string => (req as any).user?.id ?? "system";

// ── Public ────────────────────────────────────────────────────────────────────

export const getCampaignsPublicHandler = async (req: Request, res: Response) => {
  const campaigns = await campaignService.getCampaignsPublic(req.query as unknown as ListCampaignsQuery);
  res.json({ data: campaigns, message: "Lấy danh sách chiến dịch thành công" });
};

export const getCampaignsAdminHandler = async (req: Request, res: Response) => {
  const result = await campaignService.getCampaignsAdmin(req.query as unknown as ListCampaignsQuery);
  res.json({
    data: result.data,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      statusCounts: result.statusCounts,
    },
    message: "Lấy danh sách chiến dịch thành công",
  });
};

export const getActiveCampaignsHandler = async (req: Request, res: Response) => {
  const type = req.query.type as CampaignType | undefined;
  const campaigns = await campaignService.getActiveCampaigns(type);
  res.json({ data: campaigns, message: "Lấy danh sách chiến dịch đang hoạt động thành công" });
};

export const getCampaignBySlugHandler = async (req: Request, res: Response) => {
  const campaign = await campaignService.getCampaignBySlug(req.params.slug);
  res.json({ data: campaign, message: "Lấy chi tiết chiến dịch thành công" });
};

// ── Admin — Campaign CRUD ─────────────────────────────────────────────────────

export const getCampaignDetailHandler = async (req: Request, res: Response) => {
  const campaign = await campaignService.getCampaignDetail(req.params.id);
  res.json({ data: campaign, message: "Lấy chi tiết chiến dịch thành công" });
};

export const createCampaignHandler = async (req: Request, res: Response) => {
  const campaign = await campaignService.createCampaign(req.body);
  res.status(201).json({ data: campaign, message: "Tạo chiến dịch thành công" });
};

export const updateCampaignHandler = async (req: Request, res: Response) => {
  const campaign = await campaignService.updateCampaign(req.params.id, req.body);
  res.json({ data: campaign, message: "Cập nhật chiến dịch thành công" });
};

export const deleteCampaignHandler = async (req: Request, res: Response) => {
  const deletedBy = getActorId(req);
  await campaignService.deleteCampaign(req.params.id, deletedBy);
  res.json({ message: "Chuyển chiến dịch vào thùng rác thành công" });
};

export const bulkDeleteCampaignsHandler = async (req: Request, res: Response) => {
  const input = bulkDeleteCampaignsSchema.parse(req.body);
  const deletedBy = getActorId(req);
  const result = await campaignService.bulkDeleteCampaigns(input, deletedBy);
  res.json({ data: result, message: `Đã chuyển ${result.count} chiến dịch vào thùng rác` });
};

export const getDeletedCampaignsHandler = async (req: Request, res: Response) => {
  const campaigns = await campaignService.getDeletedCampaigns();
  res.json({ data: campaigns, message: "Lấy danh sách chiến dịch đã xoá thành công" });
};

export const restoreCampaignHandler = async (req: Request, res: Response) => {
  const campaign = await campaignService.restoreCampaign(req.params.id);
  res.json({ data: campaign, message: "Khôi phục chiến dịch thành công" });
};

export const hardDeleteCampaignHandler = async (req: Request, res: Response) => {
  await campaignService.hardDeleteCampaign(req.params.id);
  res.json({ message: "Xoá vĩnh viễn chiến dịch thành công" });
};

// ── Admin — Campaign Categories ───────────────────────────────────────────────

export const addCategoriesToCampaignHandler = async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined;
  try {
    const { campaignId } = req.params;
    const { categories } = req.body;
    if (files && files.length > 0 && categories) {
      for (let i = 0; i < categories.length; i++) {
        if (files[i]) {
          const uploadedImage = await uploadCampaignCategoryImage(files[i]);
          if (uploadedImage) {
            categories[i].imageUrl = uploadedImage.url;
            categories[i].imagePath = uploadedImage.publicId;
          }
        }
      }
    }
    const result = await campaignService.addCategoriesToCampaign(campaignId, categories);
    res.status(201).json({ data: result, message: "Thêm danh mục vào chiến dịch thành công" });
  } finally {
    cleanupFiles(files);
  }
};

export const updateCampaignCategoryHandler = async (req: Request, res: Response) => {
  const file = req.file;
  try {
    const { campaignId, categoryId } = req.params;
    const uploadedImage = file ? await uploadCampaignCategoryImage(file) : null;
    const updateData: UpdateCampaignCategoryInput = {
      ...req.body,
      ...(uploadedImage && { imageUrl: uploadedImage.url, imagePath: uploadedImage.publicId }),
    };
    const result = await campaignService.updateCampaignCategory(campaignId, categoryId, updateData);
    res.json({ data: result, message: "Cập nhật danh mục trong chiến dịch thành công" });
  } finally {
    cleanupFile(file);
  }
};

export const removeCategoryFromCampaignHandler = async (req: Request, res: Response) => {
  const { campaignId, categoryId } = req.params;
  await campaignService.removeCategoryFromCampaign(campaignId, categoryId);
  res.json({ message: "Xóa danh mục khỏi chiến dịch thành công" });
};

export const getCampaignCategoryHandler = async (req: Request, res: Response) => {
  const { campaignId, categoryId } = req.params;
  const result = await campaignService.getCampaignCategory(campaignId, categoryId);
  res.json({ data: result, message: "Lấy chi tiết danh mục trong chiến dịch thành công" });
};
