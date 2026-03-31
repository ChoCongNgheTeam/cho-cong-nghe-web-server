import { PrismaClient, Prisma, CampaignType } from "@prisma/client";
import { CreateCampaignInput, UpdateCampaignInput, ListCampaignsQuery, CampaignCategoryInput, UpdateCampaignCategoryInput } from "./campaign.validation";

const prisma = new PrismaClient();

// ── Query builders ─────────────────────────────────────────────────────────────

const buildCampaignWhere = (query: ListCampaignsQuery, onlyActive: boolean): Prisma.campaignsWhereInput => {
  const now = new Date();
  const where: Prisma.campaignsWhereInput = { deletedAt: null };

  if (onlyActive) {
    where.isActive = true;
  } else if (query.status) {
    // status filter — cùng pattern với promotions
    switch (query.status) {
      case "active":
        // isActive=true + đã bắt đầu + chưa hết hạn
        where.isActive = true;
        where.AND = [{ OR: [{ startDate: null }, { startDate: { lte: now } }] }, { OR: [{ endDate: null }, { endDate: { gte: now } }] }];
        break;
      case "inactive":
        where.isActive = false;
        break;
      case "upcoming":
        // isActive=true + startDate chưa tới
        where.isActive = true;
        where.startDate = { gt: now };
        break;
      case "expired":
        // endDate đã qua (dù isActive true hay false)
        where.endDate = { lt: now };
        break;
    }
  } else if (query.isActive !== undefined) {
    // Fallback nếu FE truyền isActive trực tiếp
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
  if (query.sortBy === "startDate") return [{ startDate: query.sortOrder }];
  if (query.sortBy === "endDate") return [{ endDate: query.sortOrder }];
  if (query.sortBy === "name") return [{ name: query.sortOrder }];
  return [{ createdAt: query.sortOrder }];
};

// ── Select shapes ──────────────────────────────────────────────────────────────

const selectCampaignPublic = {
  id: true,
  name: true,
  slug: true,
  type: true,
  description: true,
  startDate: true,
  endDate: true,
  _count: { select: { categories: true } },
} satisfies Prisma.campaignsSelect;

// ── Repository ─────────────────────────────────────────────────────────────────

export class CampaignRepository {
  // ── Slug / Name checks ──────────────────────────────────────────────────────

  async checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
    const campaign = await prisma.campaigns.findFirst({ where: { slug, deletedAt: null } });
    if (!campaign) return false;
    if (excludeId && campaign.id === excludeId) return false;
    return true;
  }

  async checkNameExists(name: string, excludeId?: string): Promise<boolean> {
    const campaign = await prisma.campaigns.findFirst({ where: { name, deletedAt: null } });
    if (!campaign) return false;
    if (excludeId && campaign.id === excludeId) return false;
    return true;
  }

  // ── Reads ───────────────────────────────────────────────────────────────────

  async findAllPublic(query: ListCampaignsQuery) {
    const where = buildCampaignWhere(query, true);
    const orderBy = buildCampaignOrderBy(query);
    return prisma.campaigns.findMany({ where, orderBy, select: selectCampaignPublic });
  }

  async findAllAdmin(query: ListCampaignsQuery) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;
    const where = buildCampaignWhere(query, false);
    const orderBy = buildCampaignOrderBy(query);

    const now = new Date();
    const baseWhere: Prisma.campaignsWhereInput = { deletedAt: null };

    const [data, total, activeCount, inactiveCount, upcomingCount, expiredCount] = await prisma.$transaction([
      prisma.campaigns.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { _count: { select: { categories: true } } },
      }),
      prisma.campaigns.count({ where }),

      // active: isActive=true + đã bắt đầu + chưa hết hạn
      prisma.campaigns.count({
        where: {
          ...baseWhere,
          isActive: true,
          AND: [{ OR: [{ startDate: null }, { startDate: { lte: now } }] }, { OR: [{ endDate: null }, { endDate: { gte: now } }] }],
        },
      }),
      // inactive: isActive=false
      prisma.campaigns.count({ where: { ...baseWhere, isActive: false } }),
      // upcoming: isActive=true + startDate chưa tới
      prisma.campaigns.count({
        where: { ...baseWhere, isActive: true, startDate: { gt: now } },
      }),
      // expired: endDate đã qua
      prisma.campaigns.count({ where: { ...baseWhere, endDate: { lt: now } } }),
    ]);

    // ALL = tổng không filter status (active + inactive + upcoming vv)
    // Dùng total của query ALL (không filter) thay vì total của query hiện tại
    const [allTotal] = await prisma.$transaction([prisma.campaigns.count({ where: { deletedAt: null } })]);

    const statusCounts = {
      ALL: allTotal,
      active: activeCount,
      inactive: inactiveCount,
      upcoming: upcomingCount,
      expired: expiredCount,
    };

    return { data, page, limit, total, totalPages: Math.ceil(total / limit), statusCounts };
  }

  async findDeleted() {
    return prisma.campaigns.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
      include: { _count: { select: { categories: true } } },
    });
  }

  async getActiveCampaigns(type?: CampaignType) {
    return prisma.campaigns.findMany({
      where: { isActive: true, deletedAt: null, ...(type && { type }) },
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
    return prisma.campaigns.findFirst({
      where: { slug, isActive: true, deletedAt: null },
      include: {
        categories: {
          orderBy: { position: "asc" },
          include: { category: { select: { id: true, name: true, slug: true, imageUrl: true, imagePath: true } } },
        },
      },
    });
  }

  async getCampaignById(id: string, includeDeleted = false) {
    return prisma.campaigns.findFirst({
      where: { id, ...(!includeDeleted && { deletedAt: null }) },
      include: {
        categories: {
          orderBy: { position: "asc" },
          include: { category: { select: { id: true, name: true, slug: true, imageUrl: true, imagePath: true } } },
        },
        _count: { select: { categories: true } },
      },
    });
  }

  // ── Writes ──────────────────────────────────────────────────────────────────

  async createCampaign(data: CreateCampaignInput & { slug: string }) {
    return prisma.campaigns.create({
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
    const updateData: Prisma.campaignsUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.startDate !== undefined) updateData.startDate = data.startDate;
    if (data.endDate !== undefined) updateData.endDate = data.endDate;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    return prisma.campaigns.update({
      where: { id },
      data: updateData,
      // Thêm include để trả về categories
      include: {
        categories: {
          orderBy: { position: "asc" },
          include: {
            category: { select: { id: true, name: true, slug: true, imageUrl: true, imagePath: true } },
          },
        },
        _count: { select: { categories: true } },
      },
    });
  }

  async softDelete(id: string, deletedBy: string) {
    return prisma.campaigns.update({ where: { id }, data: { deletedAt: new Date(), deletedBy } });
  }

  async restore(id: string) {
    return prisma.campaigns.update({ where: { id }, data: { deletedAt: null, deletedBy: null } });
  }

  async hardDelete(id: string) {
    return prisma.campaigns.delete({ where: { id } });
  }

  async bulkSoftDelete(ids: string[], deletedBy: string) {
    return prisma.campaigns.updateMany({
      where: { id: { in: ids }, deletedAt: null },
      data: { deletedAt: new Date(), deletedBy },
    });
  }

  // ── Campaign Categories ─────────────────────────────────────────────────────

  async checkCategoryInCampaign(campaignId: string, categoryId: string): Promise<boolean> {
    const exists = await prisma.campaign_categories.findFirst({ where: { campaignId, categoryId } });
    return !!exists;
  }

  async getCampaignCategory(campaignId: string, categoryId: string) {
    return prisma.campaign_categories.findFirst({
      where: { campaignId, categoryId },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
  }

  async addCampaignCategories(campaignId: string, categories: CampaignCategoryInput[]) {
    return prisma.$transaction(
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
    return prisma.campaign_categories.updateMany({ where: { campaignId, categoryId }, data: updateData });
  }

  async removeCampaignCategory(campaignId: string, categoryId: string) {
    return prisma.campaign_categories.deleteMany({ where: { campaignId, categoryId } });
  }

  async checkCategoryExists(categoryId: string): Promise<boolean> {
    const category = await prisma.categories.findUnique({ where: { id: categoryId } });
    return !!category;
  }
}

export const campaignRepository = new CampaignRepository();
