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
  // CAMPAIGN-1: Back To Work Setup (22/02 → 05/03)
  // ────────────────────────────────────────────────
  {
    name: "Sẵn Sàng Trở Lại Công Việc",
    slug: "san-sang-tro-lai-cong-viec",
    type: "EVENT",
    description: "Nâng cấp không gian làm việc chuyên nghiệp. Ưu đãi cực hời cho MacBook, Laptop và các thiết bị ngoại vi giúp tăng hiệu suất tối đa.",
    startDate: new Date("2026-02-21"),
    endDate: new Date("2026-03-05"),
    isActive: true,
    categoryLinks: [
      { position: 1, imagePath: "campaigns/CAMPAIGN-1_Back-To-Work-Setup/1.png", title: "MacBook Pro", description: "Hiệu năng đồ họa đỉnh cao", categorySlug: "macbook-pro-14-inch" },
      { position: 2, imagePath: "campaigns/CAMPAIGN-1_Back-To-Work-Setup/2.png", title: "Bàn Phím Văn Phòng", description: "Gõ phím êm ái, bền bỉ", categorySlug: "ban-phim-2" },
      { position: 3, imagePath: "campaigns/CAMPAIGN-1_Back-To-Work-Setup/3.png", title: "Webcam Sắc Nét", description: "Hỗ trợ hội họp trực tuyến", categorySlug: "webcam" },
      { position: 4, imagePath: "campaigns/CAMPAIGN-1_Back-To-Work-Setup/4.png", title: "Chuột Máy Tính", description: "Thiết kế công thái học", categorySlug: "chuot-2" },
      { position: 5, imagePath: "campaigns/CAMPAIGN-1_Back-To-Work-Setup/5.png", title: "Laptop Windows", description: "Đa nhiệm mượt mà", categorySlug: "laptop" },
    ],
  },

  // ────────────────────────────────────────────────
  // CAMPAIGN-2: Deal Sinh Viên (06/03 → 20/03)
  // ────────────────────────────────────────────────
  {
    name: "Deal Sinh Viên",
    slug: "deal-sinh-vien",
    type: "EVENT",
    description: "Combo học tập hoàn hảo cho sinh viên: Laptop mạnh mẽ, phụ kiện tiện lợi với mức giá ưu đãi đặc quyền.",
    startDate: new Date("2026-03-05"),
    endDate: new Date("2026-03-20"),
    isActive: true,
    categoryLinks: [
      {
        position: 6,
        imagePath: "campaigns/CAMPAIGN-2_Deal-Sinh-Vien/6.png",
        title: "Laptop Sinh Viên",
        description: "Người bạn đồng hành tin cậy",
        categorySlug: "laptop",
      },
      {
        position: 7,
        imagePath: "campaigns/CAMPAIGN-2_Deal-Sinh-Vien/7.png",
        title: "Tai Nghe Không Dây",
        description: "Tập trung học tập mọi nơi",
        categorySlug: "tai-nghe-khong-day",
      },
      {
        position: 8,
        imagePath: "campaigns/CAMPAIGN-2_Deal-Sinh-Vien/8.png",
        title: "Balo, Túi Xách",
        description: "Thời trang và bền bỉ",
        categorySlug: "balo-tui-xach",
      },
      {
        position: 9,
        imagePath: "campaigns/CAMPAIGN-2_Deal-Sinh-Vien/9.png",
        title: "Chuột Máy Tính",
        description: "Nhỏ gọn, dễ mang theo",
        categorySlug: "chuot",
      },
      {
        position: 10,
        imagePath: "campaigns/CAMPAIGN-2_Deal-Sinh-Vien/10.png",
        title: "Bàn Phím Rời",
        description: "Nâng tầm trải nghiệm gõ",
        categorySlug: "ban-phim",
      },
    ],
  },

  // ────────────────────────────────────────────────
  // CAMPAIGN-3: Smartphone Festival (21/03 → 05/04)
  // ────────────────────────────────────────────────
  {
    name: "Lễ Hội Smartphone",
    slug: "le-hoi-smartphone",
    type: "EVENT",
    description: "Đại tiệc công nghệ di động. Quy tụ những mẫu smartphone hot nhất hiện nay từ các thương hiệu hàng đầu.",
    startDate: new Date("2026-03-20"),
    endDate: new Date("2026-04-05"),
    isActive: true,
    categoryLinks: [
      { position: 1, imagePath: "campaigns/CAMPAIGN-3_Smartphone-Festival/11.png", title: "Apple iPhone", description: "iPhone 16 & 17 mới nhất", categorySlug: "apple-iphone" },
      { position: 2, imagePath: "campaigns/CAMPAIGN-3_Smartphone-Festival/12.png", title: "Samsung Galaxy", description: "Trải nghiệm Galaxy AI", categorySlug: "samsung" },
      { position: 3, imagePath: "campaigns/CAMPAIGN-3_Smartphone-Festival/13.png", title: "Xiaomi Series", description: "Cấu hình mạnh, giá tốt", categorySlug: "xiaomi-series" },
      { position: 4, imagePath: "campaigns/CAMPAIGN-3_Smartphone-Festival/14.png", title: "OPPO Series", description: "Thiết kế thời thượng", categorySlug: "oppo" },
      { position: 5, imagePath: "campaigns/CAMPAIGN-3_Smartphone-Festival/15.png", title: "Galaxy Z Series", description: "Đẳng cấp điện thoại gập", categorySlug: "galaxy-z-series" },
    ],
  },

  // ────────────────────────────────────────────────
  // CAMPAIGN-4: Laptop Performance Week (06/04 → 20/04)
  // ────────────────────────────────────────────────
  {
    name: "Tuần Lễ Laptop Hiệu Năng",
    slug: "tuan-le-laptop-hieu-nang",
    type: "EVENT",
    description: "Tuần lễ của những 'quái vật' hiệu năng. Những dòng Laptop Gaming và Workstation đỉnh nhất thế giới.",
    startDate: new Date("2026-04-05"),
    endDate: new Date("2026-04-20"),
    isActive: true,
    categoryLinks: [
      { position: 1, imagePath: "campaigns/CAMPAIGN-4_Laptop-Performance-Week/16.png", title: "Asus ROG", description: "Vũ khí của game thủ", categorySlug: "asus-rog" },
      { position: 2, imagePath: "campaigns/CAMPAIGN-4_Laptop-Performance-Week/17.png", title: "Lenovo Legion", description: "Hiệu năng thực thụ", categorySlug: "lenovo-legion-gaming" },
      { position: 3, imagePath: "campaigns/CAMPAIGN-4_Laptop-Performance-Week/18.png", title: "MacBook Pro", description: "Đỉnh cao đồ họa sáng tạo", categorySlug: "macbook-pro-16-inch" },
      { position: 4, imagePath: "campaigns/CAMPAIGN-4_Laptop-Performance-Week/19.png", title: "Acer Predator", description: "Kẻ săn mồi tốc độ", categorySlug: "acer-predator" },
      { position: 5, imagePath: "campaigns/CAMPAIGN-4_Laptop-Performance-Week/20.png", title: "Dell XPS", description: "Hoàn hảo mọi góc nhìn", categorySlug: "dell-xps" },
    ],
  },

  // ────────────────────────────────────────────────
  // CAMPAIGN-5: Sale Điện Máy Gia Đình (21/04 → 10/05)
  // ────────────────────────────────────────────────
  {
    name: "Sale Điện Máy Gia Đình",
    slug: "sale-dien-may-gia-dinh",
    type: "SEASONAL",
    description: "Nâng cấp không gian sống với ưu đãi điện máy lớn nhất mùa. Tiết kiệm chi phí cho cả gia đình.",
    startDate: new Date("2026-04-20"),
    endDate: new Date("2026-05-10"),
    isActive: true,
    categoryLinks: [
      {
        position: 1,
        imagePath: "campaigns/CAMPAIGN-5_Sale-Dien-May-Gia-Dinh/21.png",
        title: "Máy Lạnh - Điều Hòa",
        description: "Mát lạnh không gian sống",
        categorySlug: "may-lanh-dieu-hoa-inverter",
      },
      { position: 2, imagePath: "campaigns/CAMPAIGN-5_Sale-Dien-May-Gia-Dinh/22.png", title: "Tivi Giải Trí", description: "Hình ảnh sống động 4K", categorySlug: "tivi" },
      { position: 3, imagePath: "campaigns/CAMPAIGN-5_Sale-Dien-May-Gia-Dinh/23.png", title: "Máy Giặt Thông Minh", description: "Chăm sóc sợi vải tối ưu", categorySlug: "may-giat-cua-truoc" },
      { position: 4, imagePath: "campaigns/CAMPAIGN-5_Sale-Dien-May-Gia-Dinh/24.png", title: "Tủ Lạnh Inverter", description: "Thực phẩm tươi ngon lâu hơn", categorySlug: "tu-lanh-inverter" },
      { position: 5, imagePath: "campaigns/CAMPAIGN-5_Sale-Dien-May-Gia-Dinh/25.png", title: "Tủ Đông", description: "Trữ đông chuyên dụng", categorySlug: "tu-dong" },
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
