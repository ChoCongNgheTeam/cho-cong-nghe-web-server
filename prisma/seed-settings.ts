import prisma from "../src/config/db";

// Prisma enum DataType
type DataType = "STRING" | "BOOLEAN" | "NUMBER" | "JSON";

const DEFAULTS: { group: string; key: string; value: string; dataType: DataType }[] = [
  // ── general ─────────────────────────────────────────────────────────────────
  { group: "general", key: "site_name", value: "My Shop", dataType: "STRING" },
  { group: "general", key: "site_email", value: "", dataType: "STRING" },
  { group: "general", key: "site_phone", value: "", dataType: "STRING" },
  { group: "general", key: "logo_url", value: "", dataType: "STRING" },
  { group: "general", key: "favicon_url", value: "", dataType: "STRING" },
  { group: "general", key: "maintenance_mode", value: "false", dataType: "BOOLEAN" },
  { group: "general", key: "maintenance_message", value: "Hệ thống đang bảo trì.", dataType: "STRING" },

  // ── seo ─────────────────────────────────────────────────────────────────────
  { group: "seo", key: "meta_title", value: "", dataType: "STRING" },
  { group: "seo", key: "meta_description", value: "", dataType: "STRING" },
  { group: "seo", key: "og_image_url", value: "", dataType: "STRING" },
  { group: "seo", key: "google_analytics_id", value: "", dataType: "STRING" },
  { group: "seo", key: "facebook_pixel_id", value: "", dataType: "STRING" },

  // ── ecommerce ────────────────────────────────────────────────────────────────
  { group: "ecommerce", key: "default_currency", value: "VND", dataType: "STRING" },
  { group: "ecommerce", key: "enable_product_review", value: "true", dataType: "BOOLEAN" },
  { group: "ecommerce", key: "enable_star_rating", value: "true", dataType: "BOOLEAN" },
  { group: "ecommerce", key: "require_star_rating", value: "false", dataType: "BOOLEAN" },
  { group: "ecommerce", key: "show_verified_label", value: "true", dataType: "BOOLEAN" },
  { group: "ecommerce", key: "review_verified_only", value: "true", dataType: "BOOLEAN" },
  { group: "ecommerce", key: "enable_product_compare", value: "false", dataType: "BOOLEAN" },
  { group: "ecommerce", key: "enable_product_discount", value: "true", dataType: "BOOLEAN" },
  { group: "ecommerce", key: "products_per_page", value: "20", dataType: "NUMBER" },

  // ── checkout ─────────────────────────────────────────────────────────────────
  { group: "checkout", key: "enable_billing_address", value: "false", dataType: "BOOLEAN" },
  { group: "checkout", key: "billing_same_as_shipping", value: "true", dataType: "BOOLEAN" },
  { group: "checkout", key: "enable_guest_checkout", value: "true", dataType: "BOOLEAN" },
  { group: "checkout", key: "mandatory_postcode", value: "false", dataType: "BOOLEAN" },
  { group: "checkout", key: "auto_create_account_guest", value: "false", dataType: "BOOLEAN" },
  { group: "checkout", key: "send_invoice_email", value: "true", dataType: "BOOLEAN" },
  { group: "checkout", key: "enable_coupon", value: "true", dataType: "BOOLEAN" },
  { group: "checkout", key: "enable_multi_coupon", value: "false", dataType: "BOOLEAN" },
  { group: "checkout", key: "enable_wallet", value: "false", dataType: "BOOLEAN" },
  { group: "checkout", key: "enable_order_note", value: "true", dataType: "BOOLEAN" },
  { group: "checkout", key: "enable_pickup_point", value: "false", dataType: "BOOLEAN" },
  { group: "checkout", key: "enable_min_order_amount", value: "false", dataType: "BOOLEAN" },
  { group: "checkout", key: "min_order_amount", value: "0", dataType: "NUMBER" },

  // ── customer ─────────────────────────────────────────────────────────────────
  { group: "customer", key: "auto_approval", value: "true", dataType: "BOOLEAN" },
  { group: "customer", key: "email_verification", value: "false", dataType: "BOOLEAN" },

  // ── order ─────────────────────────────────────────────────────────────────────
  { group: "order", key: "order_code_prefix", value: "ORD", dataType: "STRING" },
  { group: "order", key: "order_code_separator", value: "-", dataType: "STRING" },
  { group: "order", key: "cancel_within_minutes", value: "1440", dataType: "NUMBER" },
  { group: "order", key: "return_within_days", value: "7", dataType: "NUMBER" },

  // ── wallet ─────────────────────────────────────────────────────────────────────
  { group: "wallet", key: "enable_online_recharge", value: "false", dataType: "BOOLEAN" },
  { group: "wallet", key: "enable_offline_recharge", value: "false", dataType: "BOOLEAN" },
  { group: "wallet", key: "min_recharge_amount", value: "10000", dataType: "NUMBER" },

  // ── invoice ─────────────────────────────────────────────────────────────────────
  { group: "invoice", key: "business_email", value: "", dataType: "STRING" },
  { group: "invoice", key: "business_phone", value: "", dataType: "STRING" },
  { group: "invoice", key: "business_address", value: "", dataType: "STRING" },
  { group: "invoice", key: "logo_url", value: "", dataType: "STRING" },

  // ── tax ─────────────────────────────────────────────────────────────────────────
  { group: "tax", key: "enable_tax", value: "false", dataType: "BOOLEAN" },
  { group: "tax", key: "tax_rate", value: "10", dataType: "NUMBER" },

  // ── notification_admin ────────────────────────────────────────────────────────
  { group: "notification_admin", key: "new_order", value: "true", dataType: "BOOLEAN" },
  { group: "notification_admin", key: "order_refund", value: "true", dataType: "BOOLEAN" },
  { group: "notification_admin", key: "order_cancel", value: "true", dataType: "BOOLEAN" },
  { group: "notification_admin", key: "product_review", value: "true", dataType: "BOOLEAN" },
  { group: "notification_admin", key: "wallet_recharge", value: "false", dataType: "BOOLEAN" },
];

async function main() {
  console.log(`Seeding ${DEFAULTS.length} settings...`);
  let seeded = 0;

  for (const entry of DEFAULTS) {
    await prisma.system_settings.upsert({
      where: { group_key: { group: entry.group, key: entry.key } },
      create: entry,
      update: {}, // Không ghi đè nếu đã có → chỉ tạo mới
    });
    seeded++;
  }

  console.log(`✅ Seeded ${seeded} settings entries`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
