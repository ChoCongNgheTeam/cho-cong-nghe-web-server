// prisma/seeds/seed-campaigns.ts  (hoặc tên file bạn đang dùng)

import { PrismaClient } from "@prisma/client";

interface CampaignLink {
  position: number;
  imagePath: string; // bắt buộc
  imageUrl?: string | null;
  title?: string | null;
  description?: string | null;
  categorySlug?: string; // ← dùng slug để tìm category (ưu tiên)
  categoryName?: string; // fallback nếu không có slug
}

interface CampaignSeedData {
  name: string;
  slug: string;
  type: "RANKING" | "CAMPAIGN" | "SEASONAL" | "EVENT";
  description?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  isActive: boolean;
  categoryLinks: CampaignLink[];
}

const campaignsData: CampaignSeedData[] = [
  // ────────────────────────────────────────────────
  // Nhóm 1: Campaign Mùa Hè - Điều hòa & Tủ lạnh
  // ────────────────────────────────────────────────
  {
    name: "Siêu Sale Mùa Hè 2026 - Làm Mát Cả Nhà",
    slug: "sieu-sale-mua-he-2026",
    type: "SEASONAL",
    description: "Giảm sốc đến 40% điều hòa, tủ lạnh inverter - mát lạnh cả mùa hè oi bức! Ưu đãi đặc biệt cho máy lạnh 1 chiều, 2 chiều, inverter và tủ lạnh nhiều cửa.",
    startDate: new Date("2026-05-01"),
    endDate: new Date("2026-08-31"),
    isActive: true,
    categoryLinks: [
      {
        position: 1,
        imagePath: "/campaigns/summer/may-lanh-dieu-hoa.jpg",
        title: "Máy Lạnh Điều Hòa",
        description: "Giảm đến 35% toàn bộ dòng",
        categorySlug: "may-lanh-dieu-hoa",
      },
      {
        position: 2,
        imagePath: "/campaigns/summer/may-lanh-1-chieu.jpg",
        title: "Máy Lạnh 1 Chiều",
        description: "Tiết kiệm điện, siêu mát",
        categorySlug: "may-lanh-dieu-hoa-1-chieu",
      },
      {
        position: 3,
        imagePath: "/campaigns/summer/may-lanh-2-chieu.jpg",
        title: "Máy Lạnh 2 Chiều",
        description: "Sưởi ấm + làm mát",
        categorySlug: "may-lanh-dieu-hoa-2-chieu",
      },
      {
        position: 4,
        imagePath: "/campaigns/summer/may-lanh-inverter.jpg",
        title: "Máy Lạnh Inverter",
        description: "Tiết kiệm đến 60% điện",
        categorySlug: "may-lanh-dieu-hoa-inverter",
      },
      {
        position: 5,
        imagePath: "/campaigns/summer/tu-lanh.jpg",
        title: "Tủ Lạnh",
        description: "Giữ tươi thực phẩm lâu hơn",
        categorySlug: "tu-lanh",
      },
      {
        position: 6,
        imagePath: "/campaigns/summer/tu-lanh-inverter.jpg",
        title: "Tủ Lạnh Inverter",
        description: "Siêu tiết kiệm năng lượng",
        categorySlug: "tu-lanh-inverter",
      },
      {
        position: 7,
        imagePath: "/campaigns/summer/tu-lanh-nhieu-cua.jpg",
        title: "Tủ Lạnh Nhiều Cửa",
        description: "Dung tích lớn, thông minh",
        categorySlug: "tu-lanh-nhieu-cua",
      },
    ],
  },

  {
    name: "Proactive Summer Care 2026 - Bảo Dưỡng Trước Mùa Nóng",
    slug: "proactive-summer-care-2026",
    type: "EVENT",
    description: "Bảo dưỡng điều hòa & tủ lạnh giảm đến 50% công lao động + vệ sinh miễn phí. Chuẩn bị sẵn sàng cho mùa hè mát mẻ!",
    startDate: new Date("2026-03-01"), // Bắt đầu sớm để khuyến khích bảo dưỡng trước hè
    endDate: new Date("2026-05-31"),
    isActive: true,
    categoryLinks: [
      {
        position: 1,
        imagePath: "/campaigns/summer-care/ac-service.jpg",
        title: "Bảo Dưỡng Máy Lạnh",
        description: "Jet clean + kiểm tra gas",
        categorySlug: "may-lanh-dieu-hoa",
      },
      {
        position: 2,
        imagePath: "/campaigns/summer-care/fridge-service.jpg",
        title: "Bảo Dưỡng Tủ Lạnh",
        description: "Vệ sinh dàn lạnh, kiểm tra",
        categorySlug: "tu-lanh",
      },
      {
        position: 3,
        imagePath: "/campaigns/summer-care/inverter-care.jpg",
        title: "Dòng Inverter Đặc Biệt",
        description: "Ưu đãi thêm cho inverter",
        categorySlug: "may-lanh-dieu-hoa-inverter",
      },
    ],
  },

  // ────────────────────────────────────────────────
  // Nhóm 2: Sự kiện Điện thoại (Summer Phone Event)
  // ────────────────────────────────────────────────
  {
    name: "Summer Phone Fest 2026 - Nâng Cấp Ngay Hè Này",
    slug: "summer-phone-fest-2026",
    type: "EVENT",
    description: "Sale khủng điện thoại hè 2026: iPhone 16/17 series, Samsung, Xiaomi, OPPO giảm sốc + quà tặng kèm. Đừng bỏ lỡ!",
    startDate: new Date("2026-06-01"),
    endDate: new Date("2026-08-15"),
    isActive: true,
    categoryLinks: [
      {
        position: 1,
        imagePath: "/campaigns/phone/dien-thoai.jpg",
        title: "Điện Thoại Hot",
        description: "Toàn bộ dòng smartphone",
        categorySlug: "dien-thoai",
      },
      {
        position: 2,
        imagePath: "/campaigns/phone/apple-iphone.jpg",
        title: "Apple iPhone",
        description: "iPhone 16 & 17 series mới nhất",
        categorySlug: "apple-iphone",
      },
      {
        position: 3,
        imagePath: "/campaigns/phone/iphone-17-series.jpg",
        title: "iPhone 17 Series",
        description: "Flagship mới nhất 2026",
        categorySlug: "iphone-17-series",
      },
      {
        position: 4,
        imagePath: "/campaigns/phone/iphone-16-series.jpg",
        title: "iPhone 16 Series",
        description: "Giá tốt, còn hàng sẵn",
        categorySlug: "iphone-16-series",
      },
      {
        position: 5,
        imagePath: "/campaigns/phone/samsung.jpg",
        title: "Samsung",
        description: "Galaxy S & Fold series",
        categorySlug: "samsung",
      },
      {
        position: 6,
        imagePath: "/campaigns/phone/xiaomi.jpg",
        title: "Xiaomi",
        description: "Hiệu năng cao, giá tốt",
        categorySlug: "xiaomi",
      },
      {
        position: 7,
        imagePath: "/campaigns/phone/oppo.jpg",
        title: "OPPO",
        description: "Camera đỉnh, thiết kế đẹp",
        categorySlug: "oppo",
      },
    ],
  },
];
export async function seedCampaigns(prisma: PrismaClient) {
  console.log("🌱 Seeding campaigns & campaign_categories...");

  let totalCampaigns = 0;
  let totalLinks = 0;
  let skippedLinks = 0;

  for (const camp of campaignsData) {
    const { categoryLinks, ...campaignData } = camp;

    const campaign = await prisma.campaigns.upsert({
      where: { slug: campaignData.slug },
      update: campaignData,
      create: campaignData,
    });

    console.log(`→ Campaign: ${campaign.name} (${campaign.id})`);
    totalCampaigns++;

    // Xóa liên kết cũ để reset sạch
    await prisma.campaign_categories.deleteMany({
      where: { campaignId: campaign.id },
    });

    for (const link of categoryLinks) {
      let category = null;

      // Ưu tiên tìm theo slug (nếu có)
      if (link.categorySlug) {
        category = await prisma.categories.findUnique({
          where: { slug: link.categorySlug },
        });
      }

      // Fallback tìm theo name + parentId null (root) nếu không có slug hoặc không tìm thấy
      if (!category && link.categoryName) {
        category = await prisma.categories.findFirst({
          where: {
            name: link.categoryName,
            parentId: null,
          },
        });
      }

      if (!category) {
        console.warn(`  ⚠️ Không tìm thấy category cho link "${link.title || link.position}" ` + `(slug: ${link.categorySlug || "n/a"}, name: ${link.categoryName || "n/a"}) → bỏ qua`);
        skippedLinks++;
        continue;
      }

      await prisma.campaign_categories.create({
        data: {
          campaignId: campaign.id,
          categoryId: category.id, // giờ bắt buộc và đã có id thật
          position: link.position,
          imagePath: link.imagePath,
          title: link.title,
          description: link.description,
        },
      });

      totalLinks++;
      console.log(`  + Liên kết category: ${category.name} (position ${link.position})`);
    }
  }

  console.log(`\n✅ Hoàn tất: ${totalCampaigns} campaigns | ${totalLinks} liên kết thành công | ${skippedLinks} liên kết bị bỏ qua (category không tồn tại)`);
}
