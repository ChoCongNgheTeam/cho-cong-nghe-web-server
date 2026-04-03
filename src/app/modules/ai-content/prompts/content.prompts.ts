import { GenerateProductDescriptionInput, GenerateBlogPostInput } from "../ai-content.types";

// ============================================================
// CONTENT GENERATION PROMPTS
// ============================================================

const WORD_COUNT_MAP = {
  short: { product: 150, blog: 400 },
  medium: { product: 300, blog: 800 },
  long: { product: 500, blog: 1500 },
};

const TONE_MAP = {
  professional: "chuyên nghiệp, súc tích, đáng tin cậy",
  friendly: "thân thiện, gần gũi, dễ hiểu",
  enthusiastic: "nhiệt tình, hấp dẫn, tạo cảm hứng mua sắm",
};

// ─── Product Description Prompt ─────────────────────────────
export const buildProductDescriptionPrompt = (
  input: GenerateProductDescriptionInput,
  productData: {
    name: string;
    brand: string;
    category: string;
    specifications: { group: string; items: { name: string; value: string }[] }[];
    variants: { label: string; price: number }[];
    existingDescription?: string;
  },
): string => {
  const targetLength = WORD_COUNT_MAP[input.targetLength || "medium"].product;
  const tone = TONE_MAP[input.tone || "friendly"];
  const priceMin = Math.min(...productData.variants.map((v) => v.price));
  const priceMax = Math.max(...productData.variants.map((v) => v.price));

  const specsText = productData.specifications.map((g) => `${g.group}:\n${g.items.map((i) => `- ${i.name}: ${i.value}`).join("\n")}`).join("\n\n");

  return `Bạn là chuyên gia viết nội dung thương mại điện tử tại Việt Nam. Viết mô tả sản phẩm chuẩn SEO cho shop công nghệ.

## THÔNG TIN SẢN PHẨM
- Tên: ${productData.name}
- Thương hiệu: ${productData.brand}
- Danh mục: ${productData.category}
- Giá: ${priceMin.toLocaleString("vi-VN")}đ${priceMax !== priceMin ? ` - ${priceMax.toLocaleString("vi-VN")}đ` : ""}
- Phiên bản: ${productData.variants.map((v) => v.label).join(", ")}

## THÔNG SỐ KỸ THUẬT
${specsText || "(Chưa có thông số)"}

${productData.existingDescription ? `## MÔ TẢ CŨ (để tham khảo, KHÔNG copy)\n${productData.existingDescription}` : ""}

## YÊU CẦU VIẾT
- Từ khóa SEO chính: **"${input.focusKeyword}"** — phải xuất hiện tự nhiên 3-5 lần
- Phong cách: ${tone}
- Độ dài mục tiêu: khoảng ${targetLength} từ
- Định dạng: HTML cơ bản (dùng <p>, <ul>, <li>, <strong>, <h3>)
${input.additionalNotes ? `- Lưu ý thêm: ${input.additionalNotes}` : ""}

## CẤU TRÚC MÔ TẢ
1. Đoạn mở đầu (60-80 từ): Giới thiệu sản phẩm + từ khóa chính + lý do nên mua
2. Tính năng nổi bật (bullet points): 4-6 điểm, mỗi điểm 1-2 câu, có từ khóa liên quan
3. Thông số kỹ thuật nổi bật: Chọn 3-4 thông số quan trọng nhất, giải thích lợi ích thực tế
4. Đoạn kết (30-50 từ): CTA mua hàng tự nhiên

## QUAN TRỌNG
- KHÔNG dùng ngôn ngữ quá hoa mỹ, thiếu thực tế
- KHÔNG bịa thông tin không có trong thông số kỹ thuật
- Viết cho người Việt, dùng đơn vị VND
- Trả về HTML thuần, KHÔNG có markdown hay backtick`;
};

// ─── Blog Post Prompt ────────────────────────────────────────
export const buildBlogPostPrompt = (input: GenerateBlogPostInput): string => {
  const targetLength = WORD_COUNT_MAP[input.targetLength || "medium"].blog;

  const blogTypeLabel: Record<string, string> = {
    TIN_MOI: "Tin tức công nghệ mới",
    DANH_GIA: "Đánh giá sản phẩm",
    KHUYEN_MAI: "Khuyến mãi / Deal hot",
    DIEN_MAY: "Điện máy / Gia dụng",
    NOI_BAT: "Bài viết nổi bật / Tổng hợp",
  };

  return `Bạn là chuyên gia viết content công nghệ tại Việt Nam. Viết bài blog chuẩn SEO cho shop công nghệ "Chợ Công Nghệ".

## YÊU CẦU BÀI VIẾT
- Tiêu đề: **"${input.title}"**
- Từ khóa SEO chính: **"${input.focusKeyword}"** — phải xuất hiện tự nhiên 5-8 lần
- Loại bài: ${blogTypeLabel[input.blogType] || input.blogType}
- Độ dài mục tiêu: khoảng ${targetLength} từ
${input.outline ? `- Dàn ý gợi ý:\n${input.outline}` : ""}
${input.additionalNotes ? `- Lưu ý: ${input.additionalNotes}` : ""}

## CẤU TRÚC BÀI VIẾT
1. **Intro** (80-100 từ): Hook mạnh + từ khóa chính + preview nội dung
2. **Thân bài**: Chia 3-5 section rõ ràng với <h2> heading
   - Mỗi section 150-300 từ
   - Dùng bullet list khi liệt kê
   - Đặt từ khóa chính/liên quan trong headings
3. **Kết luận** (60-80 từ): Tóm tắt + CTA đọc thêm hoặc mua hàng

## FORMAT HTML
- Dùng: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>
- KHÔNG dùng: <h1> (tiêu đề đã có ngoài), <div>, <span>, class/style
- Đặt từ khóa trong thẻ <strong> ít nhất 1 lần

## QUAN TRỌNG
- Viết tự nhiên, không spam keyword
- Thông tin phải chính xác, không bịa
- Trả về HTML thuần, KHÔNG có markdown hay backtick`;
};

// ─── Suggest Meta Description Prompt ────────────────────────
export const buildMetaDescriptionPrompt = (title: string, content: string, keyword: string): string => {
  const plainContent = content.replace(/<[^>]+>/g, " ").slice(0, 500);

  return `Viết meta description cho trang web sau:
- Tiêu đề: "${title}"
- Từ khóa: "${keyword}"
- Nội dung tóm tắt: "${plainContent}..."

Yêu cầu:
- Độ dài: 140-155 ký tự
- Có từ khóa chính
- Có CTA nhẹ (ví dụ: "Xem ngay", "Tìm hiểu thêm")
- Tiếng Việt tự nhiên

Chỉ trả về meta description, không giải thích.`;
};

// ─── Suggest Slug Prompt ─────────────────────────────────────
export const buildSlugFromTitle = (title: string): string => {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};
