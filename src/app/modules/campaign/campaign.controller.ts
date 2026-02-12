import { Request, Response, NextFunction } from "express";
import { campaignService } from "./campaign.service";
import { uploadCampaignCategoryImage } from "./campaign.helpers";
import { cleanupFile } from "@/services/file-cleanup.service";
import { ListCampaignsQuery, UpdateCampaignCategoryInput } from "./campaign.validation";
import { CampaignType } from "@prisma/client";

type ValidatedQuery<T> = Request & {
  query: T;
};

// Campaign handlers
export const getCampaignsPublicHandler = async (req: ValidatedQuery<ListCampaignsQuery>, res: Response, next: NextFunction) => {
  try {
    const campaigns = await campaignService.getCampaignsPublic(req.query);

    res.status(200).json({
      success: true,
      data: campaigns,
      message: "Lấy danh sách chiến dịch thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const getCampaignsAdminHandler = async (req: ValidatedQuery<ListCampaignsQuery>, res: Response, next: NextFunction) => {
  try {
    const campaigns = await campaignService.getCampaignsAdmin(req.query);

    res.status(200).json({
      success: true,
      data: campaigns,
      message: "Lấy danh sách chiến dịch thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const getActiveCampaignsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const type = req.query.type as CampaignType | undefined;
    const campaigns = await campaignService.getActiveCampaigns(type);

    res.status(200).json({
      success: true,
      data: campaigns,
      message: "Lấy danh sách chiến dịch đang hoạt động thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const getCampaignBySlugHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const campaign = await campaignService.getCampaignBySlug(slug);

    res.status(200).json({
      success: true,
      data: campaign,
      message: "Lấy chi tiết chiến dịch thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const getCampaignDetailHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const campaign = await campaignService.getCampaignDetail(id);

    res.status(200).json({
      success: true,
      data: campaign,
      message: "Lấy chi tiết chiến dịch thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const createCampaignHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaign = await campaignService.createCampaign(req.body);

    res.status(201).json({
      success: true,
      data: campaign,
      message: "Tạo chiến dịch thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const updateCampaignHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const campaign = await campaignService.updateCampaign(id, req.body);

    res.status(200).json({
      success: true,
      data: campaign,
      message: "Cập nhật chiến dịch thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCampaignHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await campaignService.deleteCampaign(id);

    res.status(200).json({
      success: true,
      message: "Xóa chiến dịch thành công",
    });
  } catch (error) {
    next(error);
  }
};

// Campaign Category handlers
export const addCategoriesToCampaignHandler = async (req: Request, res: Response, next: NextFunction) => {
  const files = req.files as Express.Multer.File[] | undefined;

  try {
    const { campaignId } = req.params;
    const { categories } = req.body;

    // Upload images and attach to categories
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

    // Cleanup temporary files
    if (files) {
      files.forEach((file) => cleanupFile(file));
    }

    res.status(201).json({
      success: true,
      data: result,
      message: "Thêm danh mục vào chiến dịch thành công",
    });
  } catch (error: any) {
    // Cleanup uploaded files on error
    if (files) {
      files.forEach((file) => cleanupFile(file));
    }

    next(error);
  }
};

export const updateCampaignCategoryHandler = async (req: Request, res: Response, next: NextFunction) => {
  const file = req.file;

  try {
    const { campaignId, categoryId } = req.params;

    let uploadedImage = null;
    if (file) {
      uploadedImage = await uploadCampaignCategoryImage(file);
    }

    const updateData: UpdateCampaignCategoryInput = {
      ...req.body,
      ...(uploadedImage && {
        imageUrl: uploadedImage.url,
        imagePath: uploadedImage.publicId,
      }),
    };

    const result = await campaignService.updateCampaignCategory(campaignId, categoryId, updateData);

    cleanupFile(file);

    res.status(200).json({
      success: true,
      data: result,
      message: "Cập nhật danh mục trong chiến dịch thành công",
    });
  } catch (error: any) {
    cleanupFile(file);
    next(error);
  }
};

export const removeCategoryFromCampaignHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { campaignId, categoryId } = req.params;
    await campaignService.removeCategoryFromCampaign(campaignId, categoryId);

    res.status(200).json({
      success: true,
      message: "Xóa danh mục khỏi chiến dịch thành công",
    });
  } catch (error) {
    next(error);
  }
};

export const getCampaignCategoryHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { campaignId, categoryId } = req.params;
    const result = await campaignService.getCampaignCategory(campaignId, categoryId);

    res.status(200).json({
      success: true,
      data: result,
      message: "Lấy chi tiết danh mục trong chiến dịch thành công",
    });
  } catch (error) {
    next(error);
  }
};
