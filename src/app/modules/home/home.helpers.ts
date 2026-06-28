import { CampaignType } from "@prisma/client";
import { campaignService } from "../campaign/campaign.service";
import { enrichProductsWithPricing } from "../pricing/pricing.helpers";
import { getProductsOnSaleDate, getSaleScheduleV2 } from "../product/product.service";
import { HomeCampaign, HomeSaleScheduleResponse } from "./home.types";

export const getSaleScheduleForHome = async (userId?: string): Promise<HomeSaleScheduleResponse> => {
  // Dùng date string VN để tránh UTC offset
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
  const todayVN = new Date(todayStr + "T00:00:00+07:00");
  const endDate = new Date(todayStr + "T00:00:00+07:00");
  const SALE_SCHEDULE_DAYS = 3;
  endDate.setDate(endDate.getDate() + SALE_SCHEDULE_DAYS);

  // Truyền thêm option nowOnly để filter chặt hơn
  const [schedule, todayResult] = await Promise.all([getSaleScheduleV2(todayVN, endDate), getProductsOnSaleDate(todayVN, { limit: 12, activeNow: true })]);

  const todayProductsEnriched = await enrichProductsWithPricing(todayResult.data, userId);

  return {
    schedule,
    todayProducts: {
      products: todayProductsEnriched,
      total: todayResult.total,
      date: todayResult.date as unknown as Date, // home.helpers.ts check sau
      startDate: null,
      endDate: null,
      promotions: todayResult.promotions,
    },
  };
};

export const getActiveHomeCampaigns = async (): Promise<HomeCampaign[]> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allCampaigns = await Promise.all([
    campaignService.getActiveCampaigns(CampaignType.CAMPAIGN),
    campaignService.getActiveCampaigns(CampaignType.SEASONAL),
    campaignService.getActiveCampaigns(CampaignType.EVENT),
    campaignService.getActiveCampaigns(CampaignType.FLASH_SALE),
  ]);

  const campaigns = allCampaigns.flat().filter((campaign) => {
    const isNotExpired = !campaign.endDate || new Date(campaign.endDate) >= today;
    const isNotFuture = !campaign.startDate || new Date(campaign.startDate) <= today;
    return isNotExpired && isNotFuture;
  });

  const campaignsWithCategories = await Promise.all(campaigns.map((c) => campaignService.getCampaignBySlug(c.slug)));

  return campaignsWithCategories.filter((c) => c.categories && c.categories.length > 0);
};
