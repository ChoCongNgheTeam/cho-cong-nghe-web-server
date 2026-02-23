import { PrismaClient, TargetType, PromotionActionType } from "@prisma/client";

type PromotionRuleSeed = {
  actionType: PromotionActionType;
  discountValue?: string;
  buyQuantity?: number;
  getQuantity?: number;
  giftProductVariantId?: string | null;
};

type PromotionTargetSeed = {
  targetType: TargetType;
  targetId: string | null;
};

/**
 * HƯỚNG DẪN SỬ DỤNG:
 *
 * 1. Seed data này tạo sẵn các promotion templates
 * 2. targetId để NULL - khi cần áp dụng, bạn vào DB update targetId
 * 3. Sau khi reset DB, chạy seed này để tạo lại templates
 * 4. Lấy ID từ categories/brands/products và update vào promotion_targets table
 *
 * VÍ DỤ UPDATE:
 * UPDATE promotion_targets
 * SET targetId = 'category-id-thuc-te'
 * WHERE promotionId = (SELECT id FROM promotions WHERE name = 'IPHONE_GIAM_10_PERCENT');
 */

const promotionTemplates: {
  name: string;
  description: string;
  priority: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  minOrderValue?: string;
  maxDiscountValue?: string;
  usageLimit?: number;
  rules: PromotionRuleSeed[];
  targets: PromotionTargetSeed[];
  notes?: string; // Ghi chú cho dev
}[] = [
  // ============================================================================
  // ĐIỆN THOẠI - BRAND PROMOTIONS
  // ============================================================================
  {
    name: "APPLE_IPHONE_GIAM_10_PERCENT",
    description: "Giảm 10% cho tất cả iPhone",
    priority: 20,
    isActive: true, // Mặc định tắt, bật khi cần
    notes: "Apply cho brand: Apple (iPhone) - Lấy brand ID và update vào targetId",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "10.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null, // Update brand ID sau
      },
    ],
  },

  {
    name: "XIAOMI_FLASH_SALE_15_PERCENT",
    description: "Flash Sale Xiaomi - Giảm 15%",
    priority: 25,
    isActive: false,
    notes: "Apply cho brand: Xiaomi",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "15.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.BRAND,
        targetId: null,
      },
    ],
  },

  {
    name: "SAMSUNG_GIAM_1_TRIEU",
    description: "Samsung giảm ngay 1.000.000đ",
    priority: 30,
    isActive: false,
    notes: "Apply cho brand: Samsung",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "1000000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.BRAND,
        targetId: null,
      },
    ],
  },

  {
    name: "OPPO_HOT_DEAL_20_PERCENT",
    description: "OPPO Hot Deal - Giảm 20%",
    priority: 25,
    isActive: false,
    notes: "Apply cho brand: OPPO",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "20.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.BRAND,
        targetId: null,
      },
    ],
  },

  // ============================================================================
  // ĐIỆN THOẠI - CATEGORY PROMOTIONS (iPhone Series)
  // ============================================================================
  {
    name: "IPHONE_17_SERIES_GIAM_2_TRIEU",
    description: "iPhone 17 Series - Giảm 2 triệu",
    priority: 40,
    isActive: false,
    notes: "Apply cho category: iPhone 17 Series",
    minOrderValue: "20000000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "2000000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "IPHONE_16_SERIES_TRA_GOP_0_PERCENT",
    description: "iPhone 16 Series - Trả góp 0%",
    priority: 35,
    isActive: false,
    notes: "Apply cho category: iPhone 16 Series",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "5.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "IPHONE_15_SERIES_GIAM_1_5_TRIEU",
    description: "iPhone 15 Series - Giảm 1.5 triệu",
    priority: 30,
    isActive: false,
    notes: "Apply cho category: iPhone 15 Series",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "1500000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "IPHONE_14_SERIES_HOT_SALE",
    description: "iPhone 14 Series - Hot Sale 12%",
    priority: 25,
    isActive: false,
    notes: "Apply cho category: iPhone 14 Series",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "12.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "IPHONE_13_SERIES_GIAM_GIA_SAN",
    description: "iPhone 13 Series - Giảm giá sập sàn 15%",
    priority: 20,
    isActive: false,
    notes: "Apply cho category: iPhone 13 Series",
    maxDiscountValue: "3000000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "15.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  // ============================================================================
  // ĐIỆN THOẠI - XIAOMI SERIES
  // ============================================================================
  {
    name: "POCO_SERIES_FLASH_SALE",
    description: "Poco Series - Flash Sale 18%",
    priority: 30,
    isActive: false,
    notes: "Apply cho category: Poco Series",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "18.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "XIAOMI_SERIES_GIAM_500K",
    description: "Xiaomi Series - Giảm 500K",
    priority: 25,
    isActive: false,
    notes: "Apply cho category: Xiaomi Series",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "500000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "REDMI_NOTE_SERIES_HOT_DEAL",
    description: "Redmi Note Series - Hot Deal 10%",
    priority: 20,
    isActive: false,
    notes: "Apply cho category: Redmi Note Series",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "10.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "REDMI_SERIES_GIA_SOC",
    description: "Redmi Series - Giá sốc giảm 300K",
    priority: 20,
    isActive: false,
    notes: "Apply cho category: Redmi Series",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "300000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  // ============================================================================
  // ĐIỆN THOẠI - SAMSUNG GALAXY SERIES
  // ============================================================================
  {
    name: "GALAXY_AI_LAUNCH_PROMO",
    description: "Galaxy AI - Ra mắt giảm 20%",
    priority: 50,
    isActive: false,
    notes: "Apply cho category: Galaxy AI",
    minOrderValue: "15000000.00",
    maxDiscountValue: "5000000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "20.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "GALAXY_S_SERIES_FLAGSHIP_SALE",
    description: "Galaxy S Series - Flagship Sale giảm 2.5 triệu",
    priority: 40,
    isActive: false,
    notes: "Apply cho category: Galaxy S Series",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "2500000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "GALAXY_Z_SERIES_FOLDABLE_PROMO",
    description: "Galaxy Z Series - Giảm 15% cho điện thoại gập",
    priority: 45,
    isActive: false,
    notes: "Apply cho category: Galaxy Z Series",
    minOrderValue: "20000000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "15.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "GALAXY_A_SERIES_MID_RANGE",
    description: "Galaxy A Series - Phân khúc tầm trung giảm 800K",
    priority: 25,
    isActive: false,
    notes: "Apply cho category: Galaxy A Series",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "800000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "GALAXY_M_SERIES_BUDGET_DEAL",
    description: "Galaxy M Series - Deal sinh viên 12%",
    priority: 20,
    isActive: false,
    notes: "Apply cho category: Galaxy M Series",
    maxDiscountValue: "1500000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "12.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "GALAXY_XCOVER_RUGGED_SALE",
    description: "Galaxy XCover - Điện thoại siêu bền giảm 10%",
    priority: 20,
    isActive: false,
    notes: "Apply cho category: Galaxy XCover",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "10.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  // ============================================================================
  // ĐIỆN THOẠI - OPPO SERIES
  // ============================================================================
  {
    name: "OPPO_RENO_SERIES_CAMERA_PROMO",
    description: "OPPO Reno Series - Camera đỉnh giảm 1.2 triệu",
    priority: 30,
    isActive: false,
    notes: "Apply cho category: OPPO Reno Series",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "1200000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "OPPO_A_SERIES_VALUE_DEAL",
    description: "OPPO A Series - Giá trị tốt nhất 15%",
    priority: 25,
    isActive: false,
    notes: "Apply cho category: OPPO A Series",
    maxDiscountValue: "2000000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "15.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "OPPO_FIND_SERIES_FLAGSHIP",
    description: "OPPO Find Series - Flagship giảm 18%",
    priority: 35,
    isActive: false,
    notes: "Apply cho category: OPPO Find Series",
    minOrderValue: "15000000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "18.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  // ============================================================================
  // LAPTOP - APPLE MACBOOK
  // ============================================================================
  {
    name: "MACBOOK_BRAND_PROMO",
    description: "MacBook - Giảm 10% toàn bộ dòng",
    priority: 30,
    isActive: false,
    notes: "Apply cho brand: Apple (Macbook)",
    minOrderValue: "20000000.00",
    maxDiscountValue: "8000000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "10.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.BRAND,
        targetId: null,
      },
    ],
  },

  {
    name: "MACBOOK_AIR_13_STUDENT_DEAL",
    description: "MacBook Air 13 inch - Ưu đãi sinh viên giảm 3 triệu",
    priority: 35,
    isActive: false,
    notes: "Apply cho category: MacBook Air 13 inch",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "3000000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "MACBOOK_AIR_15_LAUNCH",
    description: "MacBook Air 15 inch - Ra mắt giảm 12%",
    priority: 35,
    isActive: false,
    notes: "Apply cho category: MacBook Air 15 inch",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "12.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "MACBOOK_PRO_14_CREATIVE_PROMO",
    description: "MacBook Pro 14 inch - Dành cho sáng tạo giảm 4 triệu",
    priority: 40,
    isActive: false,
    notes: "Apply cho category: MacBook Pro 14 inch",
    minOrderValue: "35000000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "4000000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "MACBOOK_PRO_16_PROFESSIONAL",
    description: "MacBook Pro 16 inch - Professional giảm 15%",
    priority: 45,
    isActive: false,
    notes: "Apply cho category: MacBook Pro 16 inch",
    minOrderValue: "50000000.00",
    maxDiscountValue: "10000000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "15.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "MACBOOK_M5_SERIES_NEW_CHIP",
    description: "MacBook M5 Series - Chip mới nhất giảm 8%",
    priority: 50,
    isActive: false,
    notes: "Apply cho category: MacBook M5 Series",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "8.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  // ============================================================================
  // LAPTOP - ASUS
  // ============================================================================
  {
    name: "ASUS_BRAND_SALE",
    description: "ASUS - Thương hiệu uy tín giảm 12%",
    priority: 25,
    isActive: false,
    notes: "Apply cho brand: Asus",
    maxDiscountValue: "5000000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "12.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.BRAND,
        targetId: null,
      },
    ],
  },

  {
    name: "ASUS_ZENBOOK_ULTRABOOK",
    description: "Asus ZenBook - Ultrabook mỏng nhẹ giảm 2.5 triệu",
    priority: 30,
    isActive: false,
    notes: "Apply cho category: Asus ZenBook",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "2500000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "ASUS_VIVOBOOK_EVERYDAY",
    description: "Asus VivoBook - Laptop hàng ngày giảm 15%",
    priority: 25,
    isActive: false,
    notes: "Apply cho category: Asus VivoBook",
    maxDiscountValue: "3000000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "15.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "ASUS_TUF_GAMING_BUDGET",
    description: "Asus TUF Gaming - Gaming phổ thông giảm 1.8 triệu",
    priority: 30,
    isActive: false,
    notes: "Apply cho category: Asus TUF Gaming",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "1800000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "ASUS_ROG_HARDCORE_GAMING",
    description: "Asus ROG - Gaming cao cấp giảm 18%",
    priority: 40,
    isActive: false,
    notes: "Apply cho category: Asus ROG",
    minOrderValue: "30000000.00",
    maxDiscountValue: "8000000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "18.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  // ============================================================================
  // LAPTOP - LENOVO
  // ============================================================================
  {
    name: "LENOVO_BRAND_WEEK",
    description: "Lenovo Week - Giảm 10% toàn bộ",
    priority: 25,
    isActive: false,
    notes: "Apply cho brand: Lenovo",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "10.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.BRAND,
        targetId: null,
      },
    ],
  },

  {
    name: "LENOVO_LOQ_GAMING_ENTRY",
    description: "Lenovo Gaming LOQ - Entry gaming giảm 1.5 triệu",
    priority: 28,
    isActive: false,
    notes: "Apply cho category: Lenovo Gaming LOQ",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "1500000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "LENOVO_YOGA_CONVERTIBLE",
    description: "Lenovo Yoga - 2-in-1 linh hoạt giảm 13%",
    priority: 30,
    isActive: false,
    notes: "Apply cho category: Lenovo Yoga",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "13.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "LENOVO_LEGION_HARDCORE",
    description: "Lenovo Legion Gaming - Hardcore giảm 20%",
    priority: 40,
    isActive: false,
    notes: "Apply cho category: Lenovo Legion Gaming",
    minOrderValue: "25000000.00",
    maxDiscountValue: "7000000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "20.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "LENOVO_THINKBOOK_BUSINESS",
    description: "Lenovo ThinkBook - Business giảm 2 triệu",
    priority: 30,
    isActive: false,
    notes: "Apply cho category: Lenovo ThinkBook",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "2000000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "LENOVO_THINKPAD_ENTERPRISE",
    description: "Lenovo ThinkPad - Doanh nghiệp giảm 15%",
    priority: 35,
    isActive: false,
    notes: "Apply cho category: Lenovo ThinkPad",
    minOrderValue: "18000000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "15.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "LENOVO_IDEAPAD_STUDENT",
    description: "Lenovo IdeaPad - Sinh viên giảm 12%",
    priority: 25,
    isActive: false,
    notes: "Apply cho category: Lenovo IdeaPad",
    maxDiscountValue: "3000000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "12.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  // ============================================================================
  // LAPTOP - ACER
  // ============================================================================
  {
    name: "ACER_BRAND_PROMO",
    description: "Acer - Giảm giá hấp dẫn 11%",
    priority: 25,
    isActive: false,
    notes: "Apply cho brand: Acer",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "11.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.BRAND,
        targetId: null,
      },
    ],
  },

  {
    name: "ACER_SWIFT_ULTRAPORTABLE",
    description: "Acer Swift - Siêu mỏng nhẹ giảm 1.8 triệu",
    priority: 28,
    isActive: false,
    notes: "Apply cho category: Acer Swift",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "1800000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "ACER_NITRO_GAMING_MID",
    description: "Acer Nitro - Gaming tầm trung giảm 14%",
    priority: 30,
    isActive: false,
    notes: "Apply cho category: Acer Nitro",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "14.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "ACER_ASPIRE_EVERYDAY",
    description: "Acer Aspire - Văn phòng giảm 10%",
    priority: 22,
    isActive: false,
    notes: "Apply cho category: Acer Aspire",
    maxDiscountValue: "2500000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "10.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "ACER_ASPIRE_GAMING",
    description: "Acer Aspire Gaming - Gaming nhẹ giảm 1.2 triệu",
    priority: 25,
    isActive: false,
    notes: "Apply cho category: Acer Aspire Gaming",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "1200000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "ACER_PREDATOR_BEAST",
    description: "Acer Predator - Gaming thú dữ giảm 22%",
    priority: 45,
    isActive: false,
    notes: "Apply cho category: Acer Predator",
    minOrderValue: "35000000.00",
    maxDiscountValue: "10000000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "22.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  // ============================================================================
  // LAPTOP - DELL
  // ============================================================================
  {
    name: "DELL_BRAND_SALE",
    description: "Dell - Thương hiệu Mỹ giảm 12%",
    priority: 28,
    isActive: false,
    notes: "Apply cho brand: Dell",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "12.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.BRAND,
        targetId: null,
      },
    ],
  },

  {
    name: "DELL_XPS_PREMIUM",
    description: "Dell XPS - Premium giảm 3.5 triệu",
    priority: 38,
    isActive: false,
    notes: "Apply cho category: Dell XPS",
    minOrderValue: "25000000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "3500000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "DELL_INSPIRON_FAMILY",
    description: "Dell Inspiron - Dành cho gia đình giảm 13%",
    priority: 25,
    isActive: false,
    notes: "Apply cho category: Dell Inspiron",
    maxDiscountValue: "3000000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "13.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "DELL_VOSTRO_SMB",
    description: "Dell Vostro - Doanh nghiệp vừa giảm 1.5 triệu",
    priority: 28,
    isActive: false,
    notes: "Apply cho category: Dell Vostro",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "1500000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "DELL_LATITUDE_ENTERPRISE",
    description: "Dell Latitude - Doanh nghiệp lớn giảm 16%",
    priority: 35,
    isActive: false,
    notes: "Apply cho category: Dell Latitude",
    minOrderValue: "20000000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "16.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "DELL_GAMING_G_SERIES",
    description: "Dell Gaming G Series - Gaming giảm 2.2 triệu",
    priority: 32,
    isActive: false,
    notes: "Apply cho category: Dell Gaming G Series",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "2200000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  // ============================================================================
  // LAPTOP - HP
  // ============================================================================
  {
    name: "HP_BRAND_FESTIVAL",
    description: "HP Festival - Giảm 10% toàn bộ",
    priority: 25,
    isActive: false,
    notes: "Apply cho brand: HP",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "10.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.BRAND,
        targetId: null,
      },
    ],
  },

  {
    name: "HP_14_15_COMPACT",
    description: "HP 14/15 - 14s/15s - Gọn nhẹ giảm 900K",
    priority: 22,
    isActive: false,
    notes: "Apply cho category: HP 14/15 - 14s/15s",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "900000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "HP_CO_BAN_BUDGET",
    description: "HP cơ bản - Phổ thông giảm 8%",
    priority: 20,
    isActive: false,
    notes: "Apply cho category: HP cơ bản",
    maxDiscountValue: "1500000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "8.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "HP_PAVILION_LIFESTYLE",
    description: "HP Pavilion - Lifestyle giảm 12%",
    priority: 26,
    isActive: false,
    notes: "Apply cho category: HP Pavilion",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "12.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "HP_ENVY_CREATIVE",
    description: "HP Envy - Sáng tạo giảm 2 triệu",
    priority: 32,
    isActive: false,
    notes: "Apply cho category: HP Envy",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "2000000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "HP_VICTUS_GAMING_ENTRY",
    description: "HP Victus - Gaming nhập môn giảm 15%",
    priority: 30,
    isActive: false,
    notes: "Apply cho category: HP Victus",
    maxDiscountValue: "4000000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "15.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "HP_PROBOOK_BUSINESS",
    description: "HP ProBook - Business giảm 1.8 triệu",
    priority: 28,
    isActive: false,
    notes: "Apply cho category: HP ProBook",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "1800000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  // ============================================================================
  // ĐIỆN MÁY - TIVI
  // ============================================================================
  {
    name: "TIVI_QLED_PREMIUM",
    description: "Tivi QLED - Công nghệ cao cấp giảm 18%",
    priority: 35,
    isActive: false,
    notes: "Apply cho category: Tivi QLED",
    minOrderValue: "15000000.00",
    maxDiscountValue: "8000000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "18.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "TIVI_4K_ULTRA_HD",
    description: "Tivi 4K - Ultra HD giảm 3 triệu",
    priority: 30,
    isActive: false,
    notes: "Apply cho category: Tivi 4K",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "3000000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "GOOGLE_TV_SMART",
    description: "Google TV - Hệ điều hành thông minh giảm 12%",
    priority: 28,
    isActive: false,
    notes: "Apply cho category: Google TV",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "12.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  // ============================================================================
  // ĐIỆN MÁY - MÁY GIẶT
  // ============================================================================
  {
    name: "MAY_GIAT_CUA_TRUOC_PREMIUM",
    description: "Máy giặt cửa trước - Cao cấp giảm 2.5 triệu",
    priority: 30,
    isActive: false,
    notes: "Apply cho category: Máy giặt cửa trước",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "2500000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "MAY_GIAT_CUA_TREN_BASIC",
    description: "Máy giặt cửa trên - Phổ thông giảm 1.2 triệu",
    priority: 25,
    isActive: false,
    notes: "Apply cho category: Máy giặt cửa trên",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "1200000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "MAY_GIAT_SAY_COMBO",
    description: "Máy giặt sấy - 2 trong 1 giảm 15%",
    priority: 35,
    isActive: false,
    notes: "Apply cho category: Máy giặt sấy",
    minOrderValue: "12000000.00",
    maxDiscountValue: "5000000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "15.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  // ============================================================================
  // ĐIỆN MÁY - MÁY LẠNH
  // ============================================================================
  {
    name: "MAY_LANH_1_CHIEU_SUMMER",
    description: "Máy lạnh 1 chiều - Hè mát mẻ giảm 1.8 triệu",
    priority: 28,
    isActive: false,
    notes: "Apply cho category: Máy lạnh - Điều hòa 1 chiều",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "1800000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "MAY_LANH_2_CHIEU_ALL_SEASON",
    description: "Máy lạnh 2 chiều - 4 mùa giảm 12%",
    priority: 32,
    isActive: false,
    notes: "Apply cho category: Máy lạnh - Điều hòa 2 chiều",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "12.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "MAY_LANH_INVERTER_SAVE",
    description: "Máy lạnh Inverter - Tiết kiệm điện giảm 2 triệu",
    priority: 35,
    isActive: false,
    notes: "Apply cho category: Máy lạnh - Điều hòa Inverter",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "2000000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  // ============================================================================
  // ĐIỆN MÁY - TỦ LẠNH
  // ============================================================================
  {
    name: "TU_LANH_INVERTER_ENERGY_SAVE",
    description: "Tủ lạnh Inverter - Tiết kiệm năng lượng giảm 2.2 triệu",
    priority: 32,
    isActive: false,
    notes: "Apply cho category: Tủ lạnh Inverter",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "2200000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "TU_LANH_NHIEU_CUA_FAMILY",
    description: "Tủ lạnh nhiều cửa - Gia đình lớn giảm 15%",
    priority: 35,
    isActive: false,
    notes: "Apply cho category: Tủ lạnh nhiều cửa",
    minOrderValue: "15000000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "15.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "TU_LANH_SIDE_BY_SIDE_LUXURY",
    description: "Tủ lạnh Side by side - Sang trọng giảm 18%",
    priority: 40,
    isActive: false,
    notes: "Apply cho category: Side by side",
    minOrderValue: "20000000.00",
    maxDiscountValue: "8000000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "18.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "TU_LANH_MINI_COMPACT",
    description: "Tủ lạnh Mini - Gọn nhẹ giảm 600K",
    priority: 22,
    isActive: false,
    notes: "Apply cho category: Mini",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "600000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "TU_DONG_BUSINESS",
    description: "Tủ đông - Kinh doanh giảm 12%",
    priority: 28,
    isActive: false,
    notes: "Apply cho category: Tủ đông",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "12.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  // ============================================================================
  // PHỤ KIỆN - ÂM THANH
  // ============================================================================
  {
    name: "TAI_NGHE_NHET_TAI_COMPACT",
    description: "Tai nghe nhét tai - Gọn nhẹ giảm 20%",
    priority: 25,
    isActive: false,
    notes: "Apply cho category: Tai nghe nhét tai",
    maxDiscountValue: "500000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "20.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "TAI_NGHE_CHUP_TAI_PREMIUM",
    description: "Tai nghe chụp tai - Cao cấp giảm 300K",
    priority: 28,
    isActive: false,
    notes: "Apply cho category: Tai nghe chụp tai",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "300000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "TAI_NGHE_KHONG_DAY_WIRELESS",
    description: "Tai nghe không dây - Tự do giảm 25%",
    priority: 30,
    isActive: false,
    notes: "Apply cho category: Tai nghe không dây",
    maxDiscountValue: "1000000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "25.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "LOA_BLUETOOTH_PORTABLE",
    description: "Loa Bluetooth - Di động giảm 18%",
    priority: 26,
    isActive: false,
    notes: "Apply cho category: Loa Bluetooth",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "18.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "LOA_KARAOKE_PARTY",
    description: "Loa karaoke - Vui chơi giảm 500K",
    priority: 28,
    isActive: false,
    notes: "Apply cho category: Loa karaoke",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "500000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "LOA_VI_TINH_DESKTOP",
    description: "Loa vi tính - Làm việc giảm 15%",
    priority: 22,
    isActive: false,
    notes: "Apply cho category: Loa vi tính",
    maxDiscountValue: "300000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "15.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  // ============================================================================
  // PHỤ KIỆN - GAMING GEAR
  // ============================================================================
  {
    name: "GAMING_GEAR_BUNDLE",
    description: "Gaming Gear - Combo setup giảm 22%",
    priority: 35,
    isActive: false,
    notes: "Apply cho category: Thiết bị chơi game",
    minOrderValue: "2000000.00",
    maxDiscountValue: "2000000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "22.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "GAMING_TAI_NGHE_PRO",
    description: "Tai nghe Gaming - Pro giảm 350K",
    priority: 30,
    isActive: false,
    notes: "Apply cho category Gaming Gear > Tai nghe",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "350000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "GAMING_LOA_SOUND",
    description: "Loa Gaming - Âm thanh đỉnh giảm 20%",
    priority: 28,
    isActive: false,
    notes: "Apply cho category Gaming Gear > Loa",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "20.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "GAMING_CHUOT_PRECISION",
    description: "Chuột Gaming - Chính xác giảm 25%",
    priority: 28,
    isActive: false,
    notes: "Apply cho category Gaming Gear > Chuột",
    maxDiscountValue: "500000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "25.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "GAMING_BAN_PHIM_MECHANICAL",
    description: "Bàn phím Gaming - Cơ học giảm 400K",
    priority: 30,
    isActive: false,
    notes: "Apply cho category Gaming Gear > Bàn phím",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "400000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  // ============================================================================
  // PHỤ KIỆN - PHỤ KIỆN DI ĐỘNG
  // ============================================================================
  {
    name: "SAC_CAP_ESSENTIAL",
    description: "Sạc, Cáp - Thiết yếu giảm 30%",
    priority: 22,
    isActive: false,
    notes: "Apply cho category: Sạc, Cáp",
    maxDiscountValue: "200000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "30.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "SAC_DU_PHONG_POWERBANK",
    description: "Sạc dự phòng - Di động giảm 25%",
    priority: 25,
    isActive: false,
    notes: "Apply cho category: Sạc dự phòng",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "25.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "BAO_DA_OP_LUNG_PROTECT",
    description: "Bao da, Ốp lưng - Bảo vệ giảm 35%",
    priority: 20,
    isActive: false,
    notes: "Apply cho category: Bao da, Ốp lưng",
    maxDiscountValue: "150000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "35.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "MIENG_DAN_MAN_HINH_SHIELD",
    description: "Miếng dán màn hình - Chống xước giảm 40%",
    priority: 20,
    isActive: false,
    notes: "Apply cho category: Miếng dán màn hình",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "40.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "BUT_CAM_UNG_STYLUS",
    description: "Bút cảm ứng - Sáng tạo giảm 200K",
    priority: 25,
    isActive: false,
    notes: "Apply cho category: Bút cảm ứng",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "200000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  // ============================================================================
  // PHỤ KIỆN - PHỤ KIỆN LAPTOP
  // ============================================================================
  {
    name: "LAPTOP_CHUOT_MOUSE",
    description: "Chuột Laptop - Làm việc giảm 20%",
    priority: 22,
    isActive: false,
    notes: "Apply cho category Phụ kiện Laptop > Chuột",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "20.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "LAPTOP_BAN_PHIM_KEYBOARD",
    description: "Bàn phím Laptop - Gõ thoải mái giảm 150K",
    priority: 23,
    isActive: false,
    notes: "Apply cho category Phụ kiện Laptop > Bàn phím",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "150000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "LAPTOP_BALO_TUI_XACH_BAG",
    description: "Balo, Túi xách Laptop - Bảo vệ giảm 25%",
    priority: 24,
    isActive: false,
    notes: "Apply cho category Phụ kiện Laptop > Balo, Túi xách",
    maxDiscountValue: "300000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "25.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "LAPTOP_BUT_TRINH_CHIEU_PRESENTER",
    description: "Bút trình chiếu - Thuyết trình giảm 100K",
    priority: 22,
    isActive: false,
    notes: "Apply cho category Phụ kiện Laptop > Bút trình chiếu",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_FIXED,
        discountValue: "100000.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "LAPTOP_WEBCAM_CAMERA",
    description: "Webcam - Họp online giảm 30%",
    priority: 26,
    isActive: false,
    notes: "Apply cho category Phụ kiện Laptop > Webcam",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "30.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "LAPTOP_GIA_DO_STAND",
    description: "Giá đỡ Laptop - Ergonomic giảm 20%",
    priority: 23,
    isActive: false,
    notes: "Apply cho category Phụ kiện Laptop > Giá đỡ",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "20.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "LAPTOP_MIENG_LOT_CHUOT_MOUSEPAD",
    description: "Miếng lót chuột - Thoải mái giảm 40%",
    priority: 20,
    isActive: false,
    notes: "Apply cho category Phụ kiện Laptop > Miếng lót chuột",
    maxDiscountValue: "100000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "40.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "LAPTOP_HUB_CHUYEN_DOI_ADAPTER",
    description: "Hub chuyển đổi - Đa năng giảm 22%",
    priority: 25,
    isActive: false,
    notes: "Apply cho category Phụ kiện Laptop > Hub chuyển đổi",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "22.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  {
    name: "LAPTOP_PHU_BAN_PHIM_COVER",
    description: "Phủ bàn phím - Chống bụi giảm 50%",
    priority: 18,
    isActive: false,
    notes: "Apply cho category Phụ kiện Laptop > Phủ bàn phím",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "50.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null,
      },
    ],
  },

  // ============================================================================
  // SPECIAL PROMOTIONS - BUY X GET Y, GIFTS, ETC
  // ============================================================================
  {
    name: "MUA_2_TANG_1_ACCESSORY",
    description: "Mua 2 tặng 1 - Phụ kiện di động",
    priority: 40,
    isActive: false,
    notes: "Buy 2 Get 1 free cho accessories - cần config targetId cho category",
    rules: [
      {
        actionType: PromotionActionType.BUY_X_GET_Y,
        buyQuantity: 2,
        getQuantity: 1,
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null, // Phụ kiện di động category ID
      },
    ],
  },

  {
    name: "MUA_LAPTOP_TANG_CHUOT",
    description: "Mua Laptop tặng chuột không dây",
    priority: 45,
    isActive: false,
    notes: "Tặng gift khi mua laptop - cần config giftProductVariantId",
    minOrderValue: "10000000.00",
    rules: [
      {
        actionType: PromotionActionType.GIFT_PRODUCT,
        giftProductVariantId: null, // ID của chuột không dây
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null, // Laptop category ID
      },
    ],
  },

  // {
  //   name: "DIEN_THOAI_FREE_SHIPPING",
  //   description: "Điện thoại - Miễn phí vận chuyển",
  //   priority: 15,
  //   isActive: false,
  //   notes: "Free shipping cho tất cả điện thoại",
  //   rules: [
  //     {
  //       actionType: PromotionActionType.FREE_SHIPPING,
  //     },
  //   ],
  //   targets: [
  //     {
  //       targetType: TargetType.CATEGORY,
  //       targetId: null, // Điện thoại category ID
  //     },
  //   ],
  // },

  // ============================================================================
  // SEASONAL / EVENT PROMOTIONS
  // ============================================================================
  {
    name: "TET_2026_MEGA_SALE",
    description: "Tết 2026 - Mega Sale giảm 20%",
    priority: 100,
    isActive: false,
    startDate: new Date("2026-01-20"),
    endDate: new Date("2026-02-10"),
    notes: "Apply cho toàn bộ sản phẩm - targetType: ALL",
    maxDiscountValue: "10000000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "20.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.ALL,
        targetId: null,
      },
    ],
  },

  {
    name: "BLACK_FRIDAY_2026",
    description: "Black Friday 2026 - Giảm sốc 30%",
    priority: 95,
    isActive: false,
    startDate: new Date("2026-11-27"),
    endDate: new Date("2026-11-29"),
    notes: "Black Friday sale - apply toàn bộ",
    maxDiscountValue: "15000000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "30.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.ALL,
        targetId: null,
      },
    ],
  },

  {
    name: "BACK_TO_SCHOOL_2026",
    description: "Mùa tựu trường 2026 - Giảm 15%",
    priority: 50,
    isActive: false,
    startDate: new Date("2026-08-15"),
    endDate: new Date("2026-09-15"),
    notes: "Back to school - Laptop + Điện thoại",
    minOrderValue: "5000000.00",
    maxDiscountValue: "5000000.00",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "15.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null, // Laptop category
      },
      {
        targetType: TargetType.CATEGORY,
        targetId: null, // Điện thoại category
      },
    ],
  },

  {
    name: "HOT_SUMMER_DIEN_MAY",
    description: "Hè nóng bỏng - Điện máy giảm 18%",
    priority: 55,
    isActive: false,
    startDate: new Date("2026-06-01"),
    endDate: new Date("2026-08-31"),
    notes: "Summer sale - Điện máy làm mát",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "18.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.CATEGORY,
        targetId: null, // Máy lạnh
      },
      {
        targetType: TargetType.CATEGORY,
        targetId: null, // Tủ lạnh
      },
    ],
  },

  // ============================================================================
  // LOYALTY / VIP PROMOTIONS
  // ============================================================================
  {
    name: "VIP_GOLD_EXTRA_5_PERCENT",
    description: "VIP Gold - Thêm 5% mọi đơn hàng",
    priority: 10,
    isActive: false,
    notes: "Dành cho VIP Gold - apply on top of other promotions",
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "5.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.ALL,
        targetId: null,
      },
    ],
  },

  {
    name: "FIRST_ORDER_WELCOME",
    description: "Đơn hàng đầu tiên - Chào mừng giảm 10%",
    priority: 60,
    isActive: false,
    notes: "First order promotion",
    maxDiscountValue: "500000.00",
    usageLimit: 1,
    rules: [
      {
        actionType: PromotionActionType.DISCOUNT_PERCENT,
        discountValue: "10.00",
      },
    ],
    targets: [
      {
        targetType: TargetType.ALL,
        targetId: null,
      },
    ],
  },
];

/**
 * SEED FUNCTION
 */
export async function seedPromotions(prisma: PrismaClient) {
  console.log("🌱 Seeding promotion templates...");
  console.log(`📋 Total templates: ${promotionTemplates.length}`);

  const createdPromotions = [];

  for (const data of promotionTemplates) {
    console.log(`→ Processing: ${data.name}`);
    if (data.notes) {
      console.log(`  ℹ️  ${data.notes}`);
    }

    const promotion = await prisma.promotions.upsert({
      where: { name: data.name },

      update: {
        description: data.description,
        priority: data.priority,
        isActive: data.isActive,
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,
        minOrderValue: data.minOrderValue ?? null,
        maxDiscountValue: data.maxDiscountValue ?? null,
        usageLimit: data.usageLimit ?? null,
      },

      create: {
        name: data.name,
        description: data.description,
        priority: data.priority,
        isActive: data.isActive,
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,
        minOrderValue: data.minOrderValue ?? null,
        maxDiscountValue: data.maxDiscountValue ?? null,
        usageLimit: data.usageLimit ?? null,
      },
    });

    // Reset Rules + Targets (Idempotent seed)
    await prisma.promotion_rules.deleteMany({
      where: { promotionId: promotion.id },
    });

    await prisma.promotion_targets.deleteMany({
      where: { promotionId: promotion.id },
    });

    // Create Rules
    for (const r of data.rules) {
      await prisma.promotion_rules.create({
        data: {
          promotionId: promotion.id,
          actionType: r.actionType,
          discountValue: r.discountValue ?? null,
          buyQuantity: r.buyQuantity ?? null,
          getQuantity: r.getQuantity ?? null,
          giftProductVariantId: r.giftProductVariantId ?? null,
        },
      });
    }

    // Create Targets (với targetId = null)
    for (const t of data.targets) {
      await prisma.promotion_targets.create({
        data: {
          promotionId: promotion.id,
          targetType: t.targetType,
          targetId: t.targetId ?? null, // NULL - sẽ update sau
        },
      });
    }

    createdPromotions.push(promotion);
  }

  console.log(`✅ Seeded ${createdPromotions.length} promotion templates`);
  console.log("");
  console.log("📝 HƯỚNG DẪN SỬ DỤNG:");
  console.log("1. Tất cả promotion templates đã được tạo với targetId = NULL");
  console.log("2. Để kích hoạt promotion, bạn cần:");
  console.log("   - Lấy ID của category/brand/product từ DB");
  console.log("   - UPDATE promotion_targets SET targetId = 'ID-thuc-te' WHERE ...");
  console.log("   - UPDATE promotions SET isActive = true WHERE name = '...'");
  console.log("");
  console.log("VÍ DỤ UPDATE:");
  console.log("UPDATE promotion_targets");
  console.log("SET targetId = 'cat_iphone_17_series_id'");
  console.log("WHERE promotionId = (");
  console.log("  SELECT id FROM promotions");
  console.log("  WHERE name = 'IPHONE_17_SERIES_GIAM_2_TRIEU'");
  console.log(");");
  console.log("");

  return createdPromotions;
}
