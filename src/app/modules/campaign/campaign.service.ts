import { CampaignType } from "@prisma/client";
import { CreateCampaignInput, UpdateCampaignInput, ListCampaignsQuery, CampaignCategoryInput, UpdateCampaignCategoryInput } from "./campaign.validation";
import { campaignRepository } from "./campaign.repository";
import { generateUniqueCampaignSlug, deleteCampaignCategoryImage } from "./campaign.helpers";

export class CampaignService {
  // Campaign CRUD operations
  async getCampaignsPublic(query: ListCampaignsQuery) {
    return await campaignRepository.findAllPublic(query);
  }

  async getCampaignsAdmin(query: ListCampaignsQuery) {
    return await campaignRepository.findAllAdmin(query);
  }

  async getActiveCampaigns(type?: CampaignType) {
    return await campaignRepository.getActiveCampaigns(type);
  }

  async getCampaignBySlug(slug: string) {
    const campaign = await campaignRepository.getCampaignBySlug(slug);

    if (!campaign) {
      const error: any = new Error("Không tìm thấy chiến dịch");
      error.statusCode = 404;
      throw error;
    }

    return campaign;
  }

  async getCampaignDetail(id: string) {
    const campaign = await campaignRepository.getCampaignById(id);

    if (!campaign) {
      const error: any = new Error("Không tìm thấy chiến dịch");
      error.statusCode = 404;
      throw error;
    }

    return campaign;
  }

  async createCampaign(data: CreateCampaignInput) {
    // Validate dates
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      const error: any = new Error("Ngày bắt đầu phải trước ngày kết thúc");
      error.statusCode = 400;
      throw error;
    }

    const nameExists = await campaignRepository.checkNameExists(data.name);
    if (nameExists) {
      const error: any = new Error("Tên chiến dịch đã tồn tại");
      error.statusCode = 400;
      throw error;
    }

    const slug = await generateUniqueCampaignSlug(data.name, (slug) => campaignRepository.checkSlugExists(slug));

    const campaign = await campaignRepository.createCampaign({
      ...data,
      slug,
    });

    return campaign;
  }

  async updateCampaign(id: string, data: UpdateCampaignInput) {
    const existingCampaign = await campaignRepository.getCampaignById(id);
    if (!existingCampaign) {
      const error: any = new Error("Không tìm thấy chiến dịch");
      error.statusCode = 404;
      throw error;
    }

    // Validate dates
    const startDate = data.startDate !== undefined ? data.startDate : existingCampaign.startDate;
    const endDate = data.endDate !== undefined ? data.endDate : existingCampaign.endDate;

    if (startDate && endDate && startDate > endDate) {
      const error: any = new Error("Ngày bắt đầu phải trước ngày kết thúc");
      error.statusCode = 400;
      throw error;
    }

    const updateData: any = { ...data };

    if (data.name && data.name !== existingCampaign.name) {
      const nameExists = await campaignRepository.checkNameExists(data.name, id);
      if (nameExists) {
        const error: any = new Error("Tên chiến dịch đã tồn tại");
        error.statusCode = 400;
        throw error;
      }

      updateData.slug = await generateUniqueCampaignSlug(data.name, (slug) => campaignRepository.checkSlugExists(slug, id), existingCampaign.slug);
    }

    const campaign = await campaignRepository.updateCampaign(id, updateData);
    return campaign;
  }

  async deleteCampaign(id: string) {
    const campaign = await campaignRepository.getCampaignById(id);
    if (!campaign) {
      const error: any = new Error("Không tìm thấy chiến dịch");
      error.statusCode = 404;
      throw error;
    }

    // Delete all category images before deleting campaign
    if (campaign.categories && campaign.categories.length > 0) {
      for (const categoryRelation of campaign.categories) {
        if (categoryRelation.imagePath) {
          await deleteCampaignCategoryImage(categoryRelation.imagePath);
        }
      }
    }

    await campaignRepository.deleteCampaign(id);
  }

  // Campaign Category operations
  async addCategoriesToCampaign(campaignId: string, categories: CampaignCategoryInput[]) {
    const campaign = await campaignRepository.getCampaignById(campaignId);
    if (!campaign) {
      const error: any = new Error("Không tìm thấy chiến dịch");
      error.statusCode = 404;
      throw error;
    }

    // Check if categories exist
    for (const category of categories) {
      const categoryExists = await campaignRepository.checkCategoryExists(category.categoryId);
      if (!categoryExists) {
        const error: any = new Error(`Không tìm thấy danh mục với ID: ${category.categoryId}`);
        error.statusCode = 404;
        throw error;
      }

      // Check if category already in campaign
      const alreadyInCampaign = await campaignRepository.checkCategoryInCampaign(campaignId, category.categoryId);
      if (alreadyInCampaign) {
        const error: any = new Error(`Danh mục ${category.categoryId} đã có trong chiến dịch`);
        error.statusCode = 400;
        throw error;
      }
    }

    return await campaignRepository.addCampaignCategories(campaignId, categories);
  }

  async updateCampaignCategory(campaignId: string, categoryId: string, data: UpdateCampaignCategoryInput) {
    const campaignCategory = await campaignRepository.getCampaignCategory(campaignId, categoryId);
    if (!campaignCategory) {
      const error: any = new Error("Không tìm thấy danh mục trong chiến dịch");
      error.statusCode = 404;
      throw error;
    }

    const updateData: any = { ...data };

    // Handle image removal
    if (data.removeImage && campaignCategory.imagePath) {
      await deleteCampaignCategoryImage(campaignCategory.imagePath);
      updateData.imagePath = "";
      updateData.imageUrl = null;
    } else if (data.imagePath && campaignCategory.imagePath && data.imagePath !== campaignCategory.imagePath) {
      // Delete old image if new image is uploaded
      await deleteCampaignCategoryImage(campaignCategory.imagePath);
    }

    await campaignRepository.updateCampaignCategory(campaignId, categoryId, updateData);

    return await campaignRepository.getCampaignCategory(campaignId, categoryId);
  }

  async removeCategoryFromCampaign(campaignId: string, categoryId: string) {
    const campaignCategory = await campaignRepository.getCampaignCategory(campaignId, categoryId);
    if (!campaignCategory) {
      const error: any = new Error("Không tìm thấy danh mục trong chiến dịch");
      error.statusCode = 404;
      throw error;
    }

    // Delete category image
    if (campaignCategory.imagePath) {
      await deleteCampaignCategoryImage(campaignCategory.imagePath);
    }

    await campaignRepository.removeCampaignCategory(campaignId, categoryId);
  }

  async getCampaignCategory(campaignId: string, categoryId: string) {
    const campaignCategory = await campaignRepository.getCampaignCategory(campaignId, categoryId);

    if (!campaignCategory) {
      const error: any = new Error("Không tìm thấy danh mục trong chiến dịch");
      error.statusCode = 404;
      throw error;
    }

    return campaignCategory;
  }
}

export const campaignService = new CampaignService();
