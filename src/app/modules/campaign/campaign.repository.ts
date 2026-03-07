import { PrismaClient, Prisma, CampaignType } from "@prisma/client";
import { CreateCampaignInput, UpdateCampaignInput, ListCampaignsQuery, CampaignCategoryInput, UpdateCampaignCategoryInput } from "./campaign.validation";

const prisma = new PrismaClient();

const buildCampaignWhere = (query: ListCampaignsQuery, onlyActive: boolean): Prisma.campaignsWhereInput => {
  const where: Prisma.campaignsWhereInput = {};

  if (onlyActive) {
    where.isActive = true;
  } else if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }

  if (query.search) {
    where.OR = [{ name: { contains: query.search, mode: "insensitive" } }, { description: { contains: query.search, mode: "insensitive" } }];
  }

  if (query.type) {
    where.type = query.type;
  }

  return where;
};

const buildCampaignOrderBy = (query: ListCampaignsQuery): Prisma.campaignsOrderByWithRelationInput[] => {
  const orderBy: Prisma.campaignsOrderByWithRelationInput[] = [];

  if (query.sortBy === "createdAt") {
    orderBy.push({ createdAt: query.sortOrder });
  } else if (query.sortBy === "startDate") {
    orderBy.push({ startDate: query.sortOrder });
  } else if (query.sortBy === "endDate") {
    orderBy.push({ endDate: query.sortOrder });
  } else {
    orderBy.push({ name: query.sortOrder });
  }

  return orderBy;
};

export class CampaignRepository {
  // Campaign methods
  async checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
    const campaign = await prisma.campaigns.findUnique({
      where: { slug },
    });

    if (!campaign) return false;
    if (excludeId && campaign.id === excludeId) return false;

    return true;
  }

  async checkNameExists(name: string, excludeId?: string): Promise<boolean> {
    const campaign = await prisma.campaigns.findFirst({
      where: { name },
    });

    if (!campaign) return false;
    if (excludeId && campaign.id === excludeId) return false;

    return true;
  }

  async findAllPublic(query: ListCampaignsQuery) {
    const where = buildCampaignWhere(query, true);
    const orderBy = buildCampaignOrderBy(query);

    return await prisma.campaigns.findMany({
      where,
      orderBy,
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        description: true,
        startDate: true,
        endDate: true,
        _count: {
          select: { categories: true },
        },
      },
    });
  }

  async findAllAdmin(query: ListCampaignsQuery) {
    const where = buildCampaignWhere(query, false);
    const orderBy = buildCampaignOrderBy(query);

    return await prisma.campaigns.findMany({
      where,
      orderBy,
      include: {
        _count: {
          select: { categories: true },
        },
      },
    });
  }

  async getActiveCampaigns(type?: CampaignType) {
    const where: Prisma.campaignsWhereInput = {
      isActive: true,
    };

    if (type) {
      where.type = type;
    }

    return await prisma.campaigns.findMany({
      where,
      orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        description: true,
        startDate: true,
        endDate: true,
      },
    });
  }

  async getCampaignBySlug(slug: string) {
    return await prisma.campaigns.findUnique({
      where: { slug, isActive: true },
      include: {
        categories: {
          orderBy: { position: "asc" },
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                imageUrl: true,
                imagePath: true,
              },
            },
          },
        },
      },
    });
  }

  async getCampaignById(id: string) {
    return await prisma.campaigns.findUnique({
      where: { id },
      include: {
        categories: {
          orderBy: { position: "asc" },
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                imageUrl: true,
                imagePath: true,
              },
            },
          },
        },
      },
    });
  }

  async createCampaign(data: CreateCampaignInput & { slug: string }) {
    return await prisma.campaigns.create({
      data: {
        name: data.name,
        slug: data.slug,
        type: data.type,
        description: data.description || null,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        isActive: data.isActive ?? true,
      },
    });
  }

  async updateCampaign(id: string, data: UpdateCampaignInput & { slug?: string }) {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.startDate !== undefined) updateData.startDate = data.startDate;
    if (data.endDate !== undefined) updateData.endDate = data.endDate;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return await prisma.campaigns.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteCampaign(id: string) {
    return await prisma.campaigns.delete({
      where: { id },
    });
  }

  // Campaign Category methods
  async checkCategoryInCampaign(campaignId: string, categoryId: string): Promise<boolean> {
    const exists = await prisma.campaign_categories.findFirst({
      where: {
        campaignId,
        categoryId,
      },
    });

    return !!exists;
  }

  async getCampaignCategory(campaignId: string, categoryId: string) {
    return await prisma.campaign_categories.findFirst({
      where: {
        campaignId,
        categoryId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async addCampaignCategories(campaignId: string, categories: CampaignCategoryInput[]) {
    return await prisma.$transaction(
      categories.map((category) =>
        prisma.campaign_categories.create({
          data: {
            campaignId,
            categoryId: category.categoryId,
            position: category.position,
            title: category.title || null,
            description: category.description || null,
            imagePath: category.imagePath || "",
            imageUrl: category.imageUrl || null,
          },
        }),
      ),
    );
  }

  async updateCampaignCategory(campaignId: string, categoryId: string, data: UpdateCampaignCategoryInput) {
    const updateData: any = {};

    if (data.position !== undefined) updateData.position = data.position;
    if (data.title !== undefined) updateData.title = data.title || null;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.imagePath !== undefined) updateData.imagePath = data.imagePath;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

    return await prisma.campaign_categories.updateMany({
      where: {
        campaignId,
        categoryId,
      },
      data: updateData,
    });
  }

  async removeCampaignCategory(campaignId: string, categoryId: string) {
    return await prisma.campaign_categories.deleteMany({
      where: {
        campaignId,
        categoryId,
      },
    });
  }

  async getCampaignCategoriesCount(campaignId: string): Promise<number> {
    return await prisma.campaign_categories.count({
      where: { campaignId },
    });
  }

  async checkCategoryExists(categoryId: string): Promise<boolean> {
    const category = await prisma.categories.findUnique({
      where: { id: categoryId },
    });
    return !!category;
  }
}

export const campaignRepository = new CampaignRepository();
