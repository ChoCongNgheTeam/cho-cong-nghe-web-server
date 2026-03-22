import { PrismaClient, TargetType, PromotionActionType, ApplyType, StackingGroup } from "@prisma/client";

// ─── Helpers ────────────────────────────────────────────────────────────────
/**
 * VN midnight = UTC 17:00 ngày hôm trước
 * Vd: 2026-03-22 00:00 VN = 2026-03-21 17:00:00 UTC
 */
const s = (offsetDays: number): Date => {
  const d = new Date();
  const vnStr = d.toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
  const [y, m, day] = vnStr.split("-").map(Number);
  // 00:00 VN = 17:00 UTC ngày hôm trước
  const utc = new Date(Date.UTC(y, m - 1, day, 17, 0, 0, 0));
  utc.setUTCDate(utc.getUTCDate() + offsetDays - 1); // -1 vì 00:00 VN = ngày trước UTC
  return utc;
};

/**
 * VN end of day 23:59:59 = UTC 16:59:59 cùng ngày
 * Vd: 2026-03-22 23:59:59 VN = 2026-03-22 16:59:59 UTC
 */
const e = (offsetDays: number): Date => {
  const d = new Date();
  const vnStr = d.toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
  const [y, m, day] = vnStr.split("-").map(Number);
  // 23:59:59 VN = 16:59:59 UTC cùng ngày
  const utc = new Date(Date.UTC(y, m - 1, day, 16, 59, 59, 0));
  utc.setUTCDate(utc.getUTCDate() + offsetDays);
  return utc;
};
type Rule = {
  actionType: PromotionActionType;
  discountValue?: string;
  buyQuantity?: number;
  getQuantity?: number;
};

type Target = {
  targetType: TargetType;
  targetCode?: string;
  targetValue?: string;
  targetId?: string | null;
};

type Template = {
  name: string;
  description: string;
  priority: number;
  isActive: boolean;
  applyType: ApplyType;
  stackingGroup: StackingGroup;
  stopProcessing: boolean;
  startDate?: Date;
  endDate?: Date;
  maxDiscountValue?: string;
  rules: Rule[];
  targets: Target[];
};

const promotionTemplates: Template[] = [
  // ══════════════════════════════════════════════════════════════════════════
  // 🌍 ALWAYS-ON STACKABLE — không startDate/endDate
  //    Apply giá bình thường, KHÔNG xuất hiện Flash Sale calendar
  // ══════════════════════════════════════════════════════════════════════════
  {
    name: "GLOBAL_5_PERCENT",
    description: "Giảm 5% toàn bộ sản phẩm",
    priority: 5,
    isActive: true,
    applyType: ApplyType.STACKABLE,
    stackingGroup: StackingGroup.PERCENT,
    stopProcessing: false,
    rules: [{ actionType: PromotionActionType.DISCOUNT_PERCENT, discountValue: "5.00" }],
    targets: [{ targetType: TargetType.ALL }],
  },
  {
    name: "STORAGE_128GB_8_PERCENT",
    description: "Giảm 8% bản 128GB",
    priority: 30,
    isActive: true,
    applyType: ApplyType.STACKABLE,
    stackingGroup: StackingGroup.PERCENT,
    stopProcessing: false,
    rules: [{ actionType: PromotionActionType.DISCOUNT_PERCENT, discountValue: "8.00" }],
    targets: [{ targetType: TargetType.ATTRIBUTE, targetCode: "storage", targetValue: "128GB" }],
  },
  {
    name: "STORAGE_256GB_5_PERCENT",
    description: "Giảm 5% bản 256GB",
    priority: 30,
    isActive: true,
    applyType: ApplyType.STACKABLE,
    stackingGroup: StackingGroup.PERCENT,
    stopProcessing: false,
    rules: [{ actionType: PromotionActionType.DISCOUNT_PERCENT, discountValue: "5.00" }],
    targets: [{ targetType: TargetType.ATTRIBUTE, targetCode: "storage", targetValue: "256GB" }],
  },
  {
    name: "STORAGE_512GB_12_PERCENT",
    description: "Giảm 12% bản 512GB",
    priority: 30,
    isActive: true,
    applyType: ApplyType.STACKABLE,
    stackingGroup: StackingGroup.PERCENT,
    stopProcessing: false,
    rules: [{ actionType: PromotionActionType.DISCOUNT_PERCENT, discountValue: "12.00" }],
    targets: [{ targetType: TargetType.ATTRIBUTE, targetCode: "storage", targetValue: "512GB" }],
  },
  {
    name: "STORAGE_1TB_15_PERCENT",
    description: "Giảm 15% bản 1TB",
    priority: 30,
    isActive: true,
    applyType: ApplyType.STACKABLE,
    stackingGroup: StackingGroup.PERCENT,
    stopProcessing: false,
    rules: [{ actionType: PromotionActionType.DISCOUNT_PERCENT, discountValue: "15.00" }],
    targets: [{ targetType: TargetType.ATTRIBUTE, targetCode: "storage", targetValue: "1TB" }],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 🍎📱 BRAND/CATEGORY — có startDate/endDate 4-5 ngày
  //    Apply giá bình thường, KHÔNG xuất hiện Flash Sale calendar
  //    (vì không có target PRODUCT)
  // ══════════════════════════════════════════════════════════════════════════
  {
    name: "APPLE_7_PERCENT",
    description: "Giảm 7% toàn bộ sản phẩm Apple",
    priority: 10,
    isActive: true,
    applyType: ApplyType.STACKABLE,
    stackingGroup: StackingGroup.PERCENT,
    stopProcessing: false,
    startDate: s(0),
    endDate: e(4),
    rules: [{ actionType: PromotionActionType.DISCOUNT_PERCENT, discountValue: "7.00" }],
    targets: [{ targetType: TargetType.BRAND, targetId: "" }], // UPDATE: Apple brandId
  },
  {
    name: "SAMSUNG_6_PERCENT",
    description: "Giảm 6% toàn bộ sản phẩm Samsung",
    priority: 10,
    isActive: true,
    applyType: ApplyType.STACKABLE,
    stackingGroup: StackingGroup.PERCENT,
    stopProcessing: false,
    startDate: s(2),
    endDate: e(6),
    rules: [{ actionType: PromotionActionType.DISCOUNT_PERCENT, discountValue: "6.00" }],
    targets: [{ targetType: TargetType.BRAND, targetId: "" }], // UPDATE: Samsung brandId
  },
  {
    name: "XIAOMI_8_PERCENT",
    description: "Giảm 8% toàn bộ sản phẩm Xiaomi",
    priority: 10,
    isActive: true,
    applyType: ApplyType.STACKABLE,
    stackingGroup: StackingGroup.PERCENT,
    stopProcessing: false,
    startDate: s(5),
    endDate: e(9),
    rules: [{ actionType: PromotionActionType.DISCOUNT_PERCENT, discountValue: "8.00" }],
    targets: [{ targetType: TargetType.BRAND, targetId: "" }], // UPDATE: Xiaomi brandId
  },
  {
    name: "IPHONE_10_PERCENT",
    description: "Giảm 10% toàn bộ iPhone",
    priority: 20,
    isActive: true,
    applyType: ApplyType.STACKABLE,
    stackingGroup: StackingGroup.PERCENT,
    stopProcessing: false,
    startDate: s(0),
    endDate: e(4),
    rules: [{ actionType: PromotionActionType.DISCOUNT_PERCENT, discountValue: "10.00" }],
    targets: [{ targetType: TargetType.CATEGORY, targetId: "" }], // UPDATE: iPhone categoryId
  },
  {
    name: "MACBOOK_8_PERCENT",
    description: "Giảm 8% toàn bộ MacBook",
    priority: 20,
    isActive: true,
    applyType: ApplyType.STACKABLE,
    stackingGroup: StackingGroup.PERCENT,
    stopProcessing: false,
    startDate: s(3),
    endDate: e(7),
    rules: [{ actionType: PromotionActionType.DISCOUNT_PERCENT, discountValue: "8.00" }],
    targets: [{ targetType: TargetType.CATEGORY, targetId: "" }], // UPDATE: MacBook categoryId
  },
  {
    name: "LAPTOP_GAMING_6_PERCENT",
    description: "Giảm 6% laptop gaming",
    priority: 20,
    isActive: true,
    applyType: ApplyType.STACKABLE,
    stackingGroup: StackingGroup.PERCENT,
    stopProcessing: false,
    startDate: s(6),
    endDate: e(10),
    rules: [{ actionType: PromotionActionType.DISCOUNT_PERCENT, discountValue: "6.00" }],
    targets: [{ targetType: TargetType.CATEGORY, targetId: "" }], // UPDATE: Gaming categoryId
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ⚡ FLASH SALE — target PRODUCT, từng ngày
  //    → Xuất hiện trong Flash Sale calendar
  //    → EXCLUSIVE: apply xong stop
  // ══════════════════════════════════════════════════════════════════════════

  // ── D+0 ──────────────────────────────────────────────────────────────────
  {
    name: "FLASH_D0_SPECIAL_25PCT",
    description: "Flash Sale hôm nay — Sản phẩm chọn lọc giảm 25%",
    priority: 65,
    isActive: true,
    applyType: ApplyType.EXCLUSIVE,
    stackingGroup: StackingGroup.FLASH,
    stopProcessing: true,
    startDate: s(0),
    endDate: e(0),
    maxDiscountValue: "5000000",
    rules: [{ actionType: PromotionActionType.DISCOUNT_PERCENT, discountValue: "25.00" }],
    targets: [
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: iPhone 16 Pro Max
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: MacBook Air M5
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: Lenovo LOQ 15IRP9
    ],
  },

  // ── D+1 ──────────────────────────────────────────────────────────────────
  {
    name: "FLASH_D1_SPECIAL_22PCT",
    description: "Flash Sale — Sản phẩm chọn lọc giảm 22%",
    priority: 65,
    isActive: true,
    applyType: ApplyType.EXCLUSIVE,
    stackingGroup: StackingGroup.FLASH,
    stopProcessing: true,
    startDate: s(1),
    endDate: e(1),
    maxDiscountValue: "3000000",
    rules: [{ actionType: PromotionActionType.DISCOUNT_PERCENT, discountValue: "22.00" }],
    targets: [
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: iPhone 17 Pro Max
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: MacBook Pro M4 Pro
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: Samsung Galaxy S25
    ],
  },

  // ── D+2 ──────────────────────────────────────────────────────────────────
  {
    name: "FLASH_D2_SPECIAL_FIXED_2M",
    description: "Flash Sale — Sản phẩm chọn lọc giảm 2.000.000đ",
    priority: 65,
    isActive: true,
    applyType: ApplyType.EXCLUSIVE,
    stackingGroup: StackingGroup.FLASH,
    stopProcessing: true,
    startDate: s(2),
    endDate: e(2),
    rules: [{ actionType: PromotionActionType.DISCOUNT_FIXED, discountValue: "2000000" }],
    targets: [
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: MacBook Air M3
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: MacBook Air M2
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: iPhone 17 Pro
    ],
  },

  // ── D+3 ──────────────────────────────────────────────────────────────────
  {
    name: "FLASH_D3_SPECIAL_20PCT",
    description: "Flash Sale — Sản phẩm chọn lọc giảm 20%",
    priority: 65,
    isActive: true,
    applyType: ApplyType.EXCLUSIVE,
    stackingGroup: StackingGroup.FLASH,
    stopProcessing: true,
    startDate: s(3),
    endDate: e(3),
    maxDiscountValue: "4000000",
    rules: [{ actionType: PromotionActionType.DISCOUNT_PERCENT, discountValue: "20.00" }],
    targets: [
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: iPhone 16 Plus
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: iPhone 16
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: Lenovo LOQ 15IAX9E
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: Xiaomi Redmi 13x
    ],
  },

  // ── D+4 ──────────────────────────────────────────────────────────────────
  {
    name: "FLASH_D4_SPECIAL_18PCT",
    description: "Flash Sale — Sản phẩm nổi bật giảm 18%",
    priority: 65,
    isActive: true,
    applyType: ApplyType.EXCLUSIVE,
    stackingGroup: StackingGroup.FLASH,
    stopProcessing: true,
    startDate: s(4),
    endDate: e(4),
    maxDiscountValue: "3000000",
    rules: [{ actionType: PromotionActionType.DISCOUNT_PERCENT, discountValue: "18.00" }],
    targets: [
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: iPhone 15
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: iPhone 14
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: MacBook Air M5 24GB
    ],
  },

  // ── D+5-6 (cuối tuần 2 ngày) ─────────────────────────────────────────────
  {
    name: "FLASH_D5_D6_SPECIAL_20PCT",
    description: "Flash Sale cuối tuần — Sản phẩm hot giảm 20%",
    priority: 65,
    isActive: true,
    applyType: ApplyType.EXCLUSIVE,
    stackingGroup: StackingGroup.FLASH,
    stopProcessing: true,
    startDate: s(5),
    endDate: e(6),
    maxDiscountValue: "4000000",
    rules: [{ actionType: PromotionActionType.DISCOUNT_PERCENT, discountValue: "20.00" }],
    targets: [
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: MacBook Pro M4 Pro 512GB
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: iPhone 17 Pro Max 256GB
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: Samsung Galaxy S25+
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: Lenovo LOQ 15IRP9
    ],
  },

  // ── D+7 ──────────────────────────────────────────────────────────────────
  {
    name: "FLASH_D7_SPECIAL_FIXED_1M",
    description: "Flash Sale — Sản phẩm chọn lọc giảm 1.000.000đ",
    priority: 65,
    isActive: true,
    applyType: ApplyType.EXCLUSIVE,
    stackingGroup: StackingGroup.FLASH,
    stopProcessing: true,
    startDate: s(7),
    endDate: e(7),
    rules: [{ actionType: PromotionActionType.DISCOUNT_FIXED, discountValue: "1000000" }],
    targets: [
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: iPhone 13
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: iPhone 14
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: Xiaomi Redmi 13x
    ],
  },

  // ── D+8 ──────────────────────────────────────────────────────────────────
  {
    name: "FLASH_D8_SPECIAL_12PCT",
    description: "Flash Sale — Sản phẩm chọn lọc giảm 12%",
    priority: 65,
    isActive: true,
    applyType: ApplyType.EXCLUSIVE,
    stackingGroup: StackingGroup.FLASH,
    stopProcessing: true,
    startDate: s(8),
    endDate: e(8),
    maxDiscountValue: "2000000",
    rules: [{ actionType: PromotionActionType.DISCOUNT_PERCENT, discountValue: "12.00" }],
    targets: [
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: MacBook Air M2 256GB
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: MacBook Air M3 256GB
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: iPhone 16 Pro
    ],
  },

  // ── D+9 ──────────────────────────────────────────────────────────────────
  {
    name: "FLASH_D9_SPECIAL_18PCT",
    description: "Flash Sale — Sản phẩm chọn lọc giảm 18%",
    priority: 65,
    isActive: true,
    applyType: ApplyType.EXCLUSIVE,
    stackingGroup: StackingGroup.FLASH,
    stopProcessing: true,
    startDate: s(9),
    endDate: e(9),
    maxDiscountValue: "6000000",
    rules: [{ actionType: PromotionActionType.DISCOUNT_PERCENT, discountValue: "18.00" }],
    targets: [
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: MacBook Pro M4 Pro 1TB
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: iPhone 17 Pro Max 512GB
    ],
  },

  // ── D+10-11 (2 ngày) ─────────────────────────────────────────────────────
  {
    name: "FLASH_D10_D11_SPECIAL_20PCT",
    description: "Flash Sale 2 ngày — Sản phẩm nổi bật giảm 20%",
    priority: 65,
    isActive: true,
    applyType: ApplyType.EXCLUSIVE,
    stackingGroup: StackingGroup.FLASH,
    stopProcessing: true,
    startDate: s(10),
    endDate: e(11),
    maxDiscountValue: "5000000",
    rules: [{ actionType: PromotionActionType.DISCOUNT_PERCENT, discountValue: "20.00" }],
    targets: [
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: MacBook Air M5 16GB 512GB
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: iPhone 16 Pro Max 256GB
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: Lenovo LOQ 15IRP9 512GB
    ],
  },

  // ── D+12 ─────────────────────────────────────────────────────────────────
  {
    name: "FLASH_D12_SPECIAL_20PCT",
    description: "Flash Sale — Sản phẩm chọn lọc giảm 20%",
    priority: 65,
    isActive: true,
    applyType: ApplyType.EXCLUSIVE,
    stackingGroup: StackingGroup.FLASH,
    stopProcessing: true,
    startDate: s(12),
    endDate: e(12),
    maxDiscountValue: "8000000",
    rules: [{ actionType: PromotionActionType.DISCOUNT_PERCENT, discountValue: "20.00" }],
    targets: [
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: iPhone 17 Pro 256GB
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: iPhone 17 Pro Max 256GB
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: MacBook Pro M4 Pro 512GB
    ],
  },

  // ── D+14-15 (2 ngày) ─────────────────────────────────────────────────────
  {
    name: "FLASH_D14_D15_SPECIAL_18PCT",
    description: "Flash Sale 2 ngày — Sản phẩm chọn lọc giảm 18%",
    priority: 65,
    isActive: true,
    applyType: ApplyType.EXCLUSIVE,
    stackingGroup: StackingGroup.FLASH,
    stopProcessing: true,
    startDate: s(14),
    endDate: e(15),
    maxDiscountValue: "3000000",
    rules: [{ actionType: PromotionActionType.DISCOUNT_PERCENT, discountValue: "18.00" }],
    targets: [
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: MacBook Air M5 16GB 512GB
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: iPhone 16 Pro 256GB
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: Lenovo LOQ 15IRP9
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: Samsung Galaxy A55
    ],
  },

  // ── D+16 ─────────────────────────────────────────────────────────────────
  {
    name: "FLASH_D16_SPECIAL_10PCT",
    description: "Flash Sale — Sản phẩm chọn lọc giảm 10%",
    priority: 65,
    isActive: true,
    applyType: ApplyType.EXCLUSIVE,
    stackingGroup: StackingGroup.FLASH,
    stopProcessing: true,
    startDate: s(16),
    endDate: e(16),
    maxDiscountValue: "4000000",
    rules: [{ actionType: PromotionActionType.DISCOUNT_PERCENT, discountValue: "10.00" }],
    targets: [
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: MacBook Pro M4 Pro 24GB 1TB
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: MacBook Air M5 24GB 512GB
    ],
  },

  // ── D+17-18 (2 ngày) ─────────────────────────────────────────────────────
  {
    name: "FLASH_D17_D18_SPECIAL_15PCT",
    description: "Flash Sale 2 ngày — Sản phẩm chọn lọc giảm 15%",
    priority: 65,
    isActive: true,
    applyType: ApplyType.EXCLUSIVE,
    stackingGroup: StackingGroup.FLASH,
    stopProcessing: true,
    startDate: s(17),
    endDate: e(18),
    maxDiscountValue: "2000000",
    rules: [{ actionType: PromotionActionType.DISCOUNT_PERCENT, discountValue: "15.00" }],
    targets: [
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: iPhone 15 128GB
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: iPhone 14 128GB
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: Xiaomi Redmi 13x 128GB
    ],
  },

  // ── D+19 ─────────────────────────────────────────────────────────────────
  {
    name: "FLASH_D19_SPECIAL_15PCT",
    description: "Flash Sale — Sản phẩm chọn lọc giảm 15%",
    priority: 65,
    isActive: true,
    applyType: ApplyType.EXCLUSIVE,
    stackingGroup: StackingGroup.FLASH,
    stopProcessing: true,
    startDate: s(19),
    endDate: e(19),
    maxDiscountValue: "4000000",
    rules: [{ actionType: PromotionActionType.DISCOUNT_PERCENT, discountValue: "15.00" }],
    targets: [
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: iPhone 16 Pro Max 256GB
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: MacBook Air M5 16GB 256GB
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: Lenovo LOQ 15IRP9 512GB
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: Samsung Galaxy S25+
    ],
  },

  // ── D+20-21 (2 ngày — cuối tháng) ────────────────────────────────────────
  {
    name: "FLASH_D20_D21_SPECIAL_25PCT",
    description: "Flash Sale cuối tháng — Sản phẩm hot giảm 25%",
    priority: 70,
    isActive: true,
    applyType: ApplyType.EXCLUSIVE,
    stackingGroup: StackingGroup.FLASH,
    stopProcessing: true,
    startDate: s(20),
    endDate: e(21),
    maxDiscountValue: "10000000",
    rules: [{ actionType: PromotionActionType.DISCOUNT_PERCENT, discountValue: "25.00" }],
    targets: [
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: iPhone 17 Pro Max 512GB
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: MacBook Pro M4 Pro 1TB
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: MacBook Air M5 24GB 512GB
    ],
  },

  // ── D+22 ─────────────────────────────────────────────────────────────────
  {
    name: "FLASH_D22_SPECIAL_FIXED_3M",
    description: "Flash Sale — Sản phẩm chọn lọc giảm 3.000.000đ",
    priority: 65,
    isActive: true,
    applyType: ApplyType.EXCLUSIVE,
    stackingGroup: StackingGroup.FLASH,
    stopProcessing: true,
    startDate: s(22),
    endDate: e(22),
    rules: [{ actionType: PromotionActionType.DISCOUNT_FIXED, discountValue: "3000000" }],
    targets: [
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: MacBook Pro M4 Pro 512GB
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: Lenovo LOQ 15IRP9 512GB
    ],
  },

  // ── D+23-24 (2 ngày) ─────────────────────────────────────────────────────
  {
    name: "FLASH_D23_D24_SPECIAL_15PCT",
    description: "Flash Sale 2 ngày — Sản phẩm chọn lọc giảm 15%",
    priority: 65,
    isActive: true,
    applyType: ApplyType.EXCLUSIVE,
    stackingGroup: StackingGroup.FLASH,
    stopProcessing: true,
    startDate: s(23),
    endDate: e(24),
    maxDiscountValue: "3000000",
    rules: [{ actionType: PromotionActionType.DISCOUNT_PERCENT, discountValue: "15.00" }],
    targets: [
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: iPhone 16 Pro Max 256GB
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: Samsung Galaxy S25+
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: MacBook Air M3 256GB
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: Lenovo LOQ 15IRP9
    ],
  },

  // ── D+25 ─────────────────────────────────────────────────────────────────
  {
    name: "FLASH_D25_SPECIAL_15PCT",
    description: "Flash Sale — Sản phẩm chọn lọc giảm 15%",
    priority: 65,
    isActive: true,
    applyType: ApplyType.EXCLUSIVE,
    stackingGroup: StackingGroup.FLASH,
    stopProcessing: true,
    startDate: s(25),
    endDate: e(25),
    maxDiscountValue: "5000000",
    rules: [{ actionType: PromotionActionType.DISCOUNT_PERCENT, discountValue: "15.00" }],
    targets: [
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: iPhone 17 128GB
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: iPhone 17 Pro 128GB
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: MacBook Air M5 16GB 256GB
    ],
  },

  // ── D+26-27 (2 ngày) ─────────────────────────────────────────────────────
  {
    name: "FLASH_D26_D27_SPECIAL_18PCT",
    description: "Flash Sale 2 ngày — Sản phẩm chọn lọc giảm 18%",
    priority: 65,
    isActive: true,
    applyType: ApplyType.EXCLUSIVE,
    stackingGroup: StackingGroup.FLASH,
    stopProcessing: true,
    startDate: s(26),
    endDate: e(27),
    maxDiscountValue: "3000000",
    rules: [{ actionType: PromotionActionType.DISCOUNT_PERCENT, discountValue: "18.00" }],
    targets: [
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: MacBook Air M5 16GB 512GB
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: iPhone 17 128GB
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: Lenovo LOQ 15IAX9E
    ],
  },

  // ── D+28-29 (BIG SALE cuối tháng) ────────────────────────────────────────
  {
    name: "FLASH_D28_D29_SPECIAL_30PCT",
    description: "BIG SALE — Sản phẩm siêu hot giảm 30%",
    priority: 75,
    isActive: true,
    applyType: ApplyType.EXCLUSIVE,
    stackingGroup: StackingGroup.FLASH,
    stopProcessing: true,
    startDate: s(28),
    endDate: e(29),
    maxDiscountValue: "12000000",
    rules: [{ actionType: PromotionActionType.DISCOUNT_PERCENT, discountValue: "30.00" }],
    targets: [
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: iPhone 17 Pro Max 512GB
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: MacBook Pro M4 Pro 1TB
      { targetType: TargetType.PRODUCT, targetId: "" }, // UPDATE: MacBook Air M5 24GB 512GB
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 🎁 GIFT
  // ══════════════════════════════════════════════════════════════════════════
  {
    name: "BUY2_GET1_XIAOMI",
    description: "Mua 2 tặng 1 — Xiaomi",
    priority: 40,
    isActive: true,
    applyType: ApplyType.STACKABLE,
    stackingGroup: StackingGroup.GIFT,
    stopProcessing: false,
    startDate: s(3),
    endDate: e(8),
    rules: [{ actionType: PromotionActionType.BUY_X_GET_Y, buyQuantity: 2, getQuantity: 1 }],
    targets: [{ targetType: TargetType.BRAND, targetId: "" }], // UPDATE: Xiaomi brandId
  },
];

// ─── Seed function ───────────────────────────────────────────────────────────
export async function seedPromotions(prisma: PrismaClient) {
  console.log("🌱 Seeding promotions...");
  console.log(`📋 Total: ${promotionTemplates.length} templates\n`);

  for (const data of promotionTemplates) {
    const promotion = await prisma.promotions.upsert({
      where: { name: data.name },
      update: {
        description: data.description,
        priority: data.priority,
        isActive: data.isActive,
        applyType: data.applyType,
        stackingGroup: data.stackingGroup,
        stopProcessing: data.stopProcessing,
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,
        maxDiscountValue: data.maxDiscountValue ?? null,
      },
      create: {
        name: data.name,
        description: data.description,
        priority: data.priority,
        isActive: data.isActive,
        applyType: data.applyType,
        stackingGroup: data.stackingGroup,
        stopProcessing: data.stopProcessing,
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,
        maxDiscountValue: data.maxDiscountValue ?? null,
      },
    });

    await prisma.promotion_rules.deleteMany({ where: { promotionId: promotion.id } });
    await prisma.promotion_targets.deleteMany({ where: { promotionId: promotion.id } });

    for (const r of data.rules) {
      await prisma.promotion_rules.create({
        data: {
          promotionId: promotion.id,
          actionType: r.actionType,
          discountValue: r.discountValue ?? null,
          buyQuantity: r.buyQuantity ?? null,
          getQuantity: r.getQuantity ?? null,
        },
      });
    }

    for (const t of data.targets) {
      await prisma.promotion_targets.create({
        data: {
          promotionId: promotion.id,
          targetType: t.targetType,
          targetId: t.targetId || null,
          targetCode: t.targetCode ?? null,
          targetValue: t.targetValue ?? null,
        },
      });
    }

    const dateStr = data.startDate ? `${data.startDate.toLocaleDateString("vi-VN")} → ${data.endDate?.toLocaleDateString("vi-VN")}` : "always-on";
    console.log(`  ✅ ${data.name} [${data.applyType}/${data.stackingGroup}] ${dateStr}`);
  }

  console.log(`\n✅ Done. ${promotionTemplates.length} promotions seeded.`);
  console.log("\n📝 Cần UPDATE targetId sau khi seed:");
  console.log("  APPLE_7_PERCENT → Apple brandId");
  console.log("  SAMSUNG_6_PERCENT → Samsung brandId");
  console.log("  XIAOMI_8_PERCENT, BUY2_GET1_XIAOMI → Xiaomi brandId");
  console.log("  IPHONE_10_PERCENT → iPhone categoryId");
  console.log("  MACBOOK_8_PERCENT → MacBook categoryId");
  console.log("  LAPTOP_GAMING_6_PERCENT → Gaming categoryId");
  console.log("  FLASH_*_SPECIAL_* → UPDATE từng targetId (product UUIDs) theo comment trong code");
}
