import { CampaignType } from "@prisma/client";
import { CreateCampaignInput, UpdateCampaignInput, ListCampaignsQuery, CampaignCategoryInput, UpdateCampaignCategoryInput, BulkDeleteCampaignsInput } from "./campaign.validation";
import { campaignRepository } from "./campaign.repository";
import { generateUniqueCampaignSlug, deleteCampaignCategoryImage } from "./campaign.helpers";
import { NotFoundError, BadRequestError } from "@/errors";
import { revalidateTags } from "@/shared/cache/revalidate.service";
import { CACHE_TAGS } from "@/shared/cache/cache-tags.constants";

// Campaign hiển thị ở Home (SeasonalSale) qua HOME_STATIC — cache dài (3600s),
// nên bất kỳ thay đổi nào ở campaign/campaign category đều cần invalidate ngay.
const CAMPAIGN_CACHE_TAGS = [CACHE_TAGS.HOME_STATIC];

export class CampaignService {
  // ── Public reads ────────────────────────────────────────────────────────────

  async getCampaignsPublic(query: ListCampaignsQuery) {
    return campaignRepository.findAllPublic(query);
  }

  async getCampaignsAdmin(query: ListCampaignsQuery) {
    return campaignRepository.findAllAdmin(query);
  }

  async getActiveCampaigns(type?: CampaignType) {
    return campaignRepository.getActiveCampaigns(type);
  }

  async getCampaignBySlug(slug: string) {
    const campaign = await campaignRepository.getCampaignBySlug(slug);
    if (!campaign) throw new NotFoundError("Chiến dịch");
    return campaign;
  }

  async getCampaignDetail(id: string) {
    const campaign = await campaignRepository.getCampaignById(id);
    if (!campaign) throw new NotFoundError("Chiến dịch");
    return campaign;
  }

  async getDeletedCampaigns() {
    return campaignRepository.findDeleted();
  }

  // ── Mutates ─────────────────────────────────────────────────────────────────

  async createCampaign(data: CreateCampaignInput) {
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      throw new BadRequestError("Ngày bắt đầu phải trước ngày kết thúc");
    }

    const nameExists = await campaignRepository.checkNameExists(data.name);
    if (nameExists) throw new BadRequestError("Tên chiến dịch đã tồn tại");

    const slug = await generateUniqueCampaignSlug(data.name, (s) => campaignRepository.checkSlugExists(s));
    const result = await campaignRepository.createCampaign({ ...data, slug });
    revalidateTags(CAMPAIGN_CACHE_TAGS);
    return result;
  }

  async updateCampaign(id: string, data: UpdateCampaignInput) {
    const existing = await campaignRepository.getCampaignById(id);
    if (!existing) throw new NotFoundError("Chiến dịch");

    const startDate = data.startDate ?? existing.startDate;
    const endDate = data.endDate ?? existing.endDate;
    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestError("Ngày bắt đầu phải trước ngày kết thúc");
    }

    const updateData: any = { ...data };
    if (data.name && data.name !== existing.name) {
      const nameExists = await campaignRepository.checkNameExists(data.name, id);
      if (nameExists) throw new BadRequestError("Tên chiến dịch đã tồn tại");
      updateData.slug = await generateUniqueCampaignSlug(data.name, (s) => campaignRepository.checkSlugExists(s, id), existing.slug);
    }

    const result = await campaignRepository.updateCampaign(id, updateData);
    revalidateTags(CAMPAIGN_CACHE_TAGS);
    return result;
  }

  async deleteCampaign(id: string, deletedBy: string) {
    const campaign = await campaignRepository.getCampaignById(id);
    if (!campaign) throw new NotFoundError("Chiến dịch");
    const result = await campaignRepository.softDelete(id, deletedBy);
    revalidateTags(CAMPAIGN_CACHE_TAGS);
    return result;
  }

  async bulkDeleteCampaigns(input: BulkDeleteCampaignsInput, deletedBy: string) {
    const result = await campaignRepository.bulkSoftDelete(input.ids, deletedBy);
    revalidateTags(CAMPAIGN_CACHE_TAGS);
    return result;
  }

  async restoreCampaign(id: string) {
    const campaign = await campaignRepository.getCampaignById(id, true);
    if (!campaign) throw new NotFoundError("Chiến dịch");
    if (!campaign.deletedAt) throw new BadRequestError("Chiến dịch chưa bị xoá");

    const nameConflict = await campaignRepository.checkNameExists(campaign.name, id);
    if (nameConflict) {
      throw new BadRequestError(`Tên "${campaign.name}" đã tồn tại ở chiến dịch khác. Vui lòng đổi tên trước khi khôi phục.`);
    }

    const result = await campaignRepository.restore(id);
    revalidateTags(CAMPAIGN_CACHE_TAGS);
    return result;
  }

  async hardDeleteCampaign(id: string) {
    const campaign = await campaignRepository.getCampaignById(id, true);
    if (!campaign) throw new NotFoundError("Chiến dịch");
    if (!campaign.deletedAt) {
      throw new BadRequestError("Chỉ có thể xoá vĩnh viễn chiến dịch đã chuyển vào thùng rác");
    }

    if (campaign.categories?.length > 0) {
      for (const cat of campaign.categories) {
        if (cat.imagePath) await deleteCampaignCategoryImage(cat.imagePath);
      }
    }

    const result = await campaignRepository.hardDelete(id);
    revalidateTags(CAMPAIGN_CACHE_TAGS);
    return result;
  }

  // ── Campaign Categories ─────────────────────────────────────────────────────

  async addCategoriesToCampaign(campaignId: string, categories: CampaignCategoryInput[]) {
    const campaign = await campaignRepository.getCampaignById(campaignId);
    if (!campaign) throw new NotFoundError("Chiến dịch");

    for (const category of categories) {
      const categoryExists = await campaignRepository.checkCategoryExists(category.categoryId);
      if (!categoryExists) throw new NotFoundError(`Danh mục với ID: ${category.categoryId}`);
      const alreadyInCampaign = await campaignRepository.checkCategoryInCampaign(campaignId, category.categoryId);
      if (alreadyInCampaign) throw new BadRequestError(`Danh mục ${category.categoryId} đã có trong chiến dịch`);
    }

    const result = await campaignRepository.addCampaignCategories(campaignId, categories);
    revalidateTags(CAMPAIGN_CACHE_TAGS);
    return result;
  }

  async updateCampaignCategory(campaignId: string, categoryId: string, data: UpdateCampaignCategoryInput) {
    const campaignCategory = await campaignRepository.getCampaignCategory(campaignId, categoryId);
    if (!campaignCategory) throw new NotFoundError("Danh mục trong chiến dịch");

    const updateData: any = { ...data };
    if (data.removeImage && campaignCategory.imagePath) {
      await deleteCampaignCategoryImage(campaignCategory.imagePath);
      updateData.imagePath = "";
      updateData.imageUrl = null;
    } else if (data.imagePath && campaignCategory.imagePath && data.imagePath !== campaignCategory.imagePath) {
      await deleteCampaignCategoryImage(campaignCategory.imagePath);
    }

    await campaignRepository.updateCampaignCategory(campaignId, categoryId, updateData);
    revalidateTags(CAMPAIGN_CACHE_TAGS);
    return campaignRepository.getCampaignCategory(campaignId, categoryId);
  }

  async removeCategoryFromCampaign(campaignId: string, categoryId: string) {
    const campaignCategory = await campaignRepository.getCampaignCategory(campaignId, categoryId);
    if (!campaignCategory) throw new NotFoundError("Danh mục trong chiến dịch");
    if (campaignCategory.imagePath) await deleteCampaignCategoryImage(campaignCategory.imagePath);
    await campaignRepository.removeCampaignCategory(campaignId, categoryId);
    revalidateTags(CAMPAIGN_CACHE_TAGS);
  }

  async getCampaignCategory(campaignId: string, categoryId: string) {
    const campaignCategory = await campaignRepository.getCampaignCategory(campaignId, categoryId);
    if (!campaignCategory) throw new NotFoundError("Danh mục trong chiến dịch");
    return campaignCategory;
  }
}

export const campaignService = new CampaignService();
