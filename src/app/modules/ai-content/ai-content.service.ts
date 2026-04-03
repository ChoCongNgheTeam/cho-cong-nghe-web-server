import OpenAI from "openai";
import { env } from "@/config/env";
import prisma from "@/config/db";
import { GenerateProductDescriptionInput, GenerateBlogPostInput, GeneratedContent, SEOScore } from "./ai-content.types";
import { buildProductDescriptionPrompt, buildProductDescriptionPromptFromName, buildBlogPostPrompt, buildMetaDescriptionPrompt, buildSlugFromTitle } from "./prompts/content.prompts";
import { analyzeSEO } from "./seo.analyzer";

// ============================================================
// AI CONTENT SERVICE
// ============================================================

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  timeout: 180_000, // 3 phút — đủ cho cả blog dài
  maxRetries: 2,
});

// ─── callOpenAI ─────────────────────────────────────────────
const callOpenAI = async (prompt: string, maxTokens: number): Promise<string> => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: maxTokens,
  });
  return response.choices[0].message.content || "";
};

// ─── Fetch product data từ DB ────────────────────────────────
const fetchProductData = async (productId: string) => {
  const product = await prisma.products.findFirst({
    where: { id: productId, deletedAt: null },
    select: {
      name: true,
      description: true,
      brand: { select: { name: true } },
      category: { select: { name: true } },
      variants: {
        where: { isActive: true },
        select: {
          price: true,
          variantAttributes: {
            select: {
              attributeOption: {
                select: { label: true, attribute: { select: { name: true } } },
              },
            },
          },
        },
        orderBy: { price: "asc" },
        take: 10,
      },
      productSpecifications: {
        select: {
          value: true,
          specification: { select: { name: true, group: true } },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!product) throw new Error("Sản phẩm không tồn tại");

  const specGroups: Record<string, { name: string; value: string }[]> = {};
  for (const ps of product.productSpecifications) {
    const group = ps.specification.group || "Thông số khác";
    if (!specGroups[group]) specGroups[group] = [];
    specGroups[group].push({ name: ps.specification.name, value: ps.value });
  }

  const variants = product.variants.map((v) => {
    const label = v.variantAttributes.map((va) => va.attributeOption.label).join(" / ") || "Mặc định";
    return { label, price: Number(v.price) };
  });

  return {
    name: product.name,
    brand: product.brand.name,
    category: product.category.name,
    specifications: Object.entries(specGroups).map(([group, items]) => ({
      group,
      items,
    })),
    variants,
    existingDescription: product.description || undefined,
  };
};

// ─── 1. Generate Product Description (có productId — từ DB) ──
export const generateProductDescription = async (input: GenerateProductDescriptionInput, createdBy: string): Promise<GeneratedContent> => {
  const productData = await fetchProductData(input.productId!);

  const prompt = buildProductDescriptionPrompt(input, productData);
  const generatedContent = await callOpenAI(prompt, 1500);

  const seoScore = analyzeSEO(generatedContent, productData.name, input.focusKeyword, "product");

  const suggestedMetaDescription = (await callOpenAI(buildMetaDescriptionPrompt(productData.name, generatedContent, input.focusKeyword), 200)).trim();

  // Best-effort save
  prisma.ai_contents
    .create({
      data: {
        type: "PRODUCT_DESCRIPTION",
        referenceId: input.productId,
        focusKeyword: input.focusKeyword,
        inputData: input as any,
        outputContent: generatedContent,
        seoScore: seoScore.overall,
        seoDetails: seoScore as any,
        createdBy,
      },
    })
    .catch((err) => console.error("[ai-content] DB save failed:", err));

  return {
    content: generatedContent,
    seoScore,
    suggestedTitle: productData.name,
    suggestedMetaDescription,
  };
};

// ─── 2. Generate Product Description (KHÔNG có productId) ────
// Dùng khi đang tạo sản phẩm mới, chỉ có tên + keyword
export const generateProductDescriptionFromName = async (
  input: {
    productName: string;
    focusKeyword: string;
    tone?: "professional" | "friendly" | "enthusiastic";
    targetLength?: "short" | "medium" | "long";
    additionalNotes?: string;
  },
  createdBy: string,
): Promise<GeneratedContent> => {
  const prompt = buildProductDescriptionPromptFromName(input);
  const generatedContent = await callOpenAI(prompt, 1500);

  const seoScore = analyzeSEO(generatedContent, input.productName, input.focusKeyword, "product");

  const suggestedMetaDescription = (await callOpenAI(buildMetaDescriptionPrompt(input.productName, generatedContent, input.focusKeyword), 200)).trim();

  prisma.ai_contents
    .create({
      data: {
        type: "PRODUCT_DESCRIPTION",
        focusKeyword: input.focusKeyword,
        inputData: input as any,
        outputContent: generatedContent,
        seoScore: seoScore.overall,
        seoDetails: seoScore as any,
        createdBy,
      },
    })
    .catch((err) => console.error("[ai-content] DB save failed:", err));

  return {
    content: generatedContent,
    seoScore,
    suggestedTitle: input.productName,
    suggestedMetaDescription,
  };
};

// ─── 3. Generate Blog Post ────────────────────────────────────
export const generateBlogPost = async (input: GenerateBlogPostInput, createdBy: string): Promise<GeneratedContent> => {
  const prompt = buildBlogPostPrompt(input);
  const generatedContent = await callOpenAI(prompt, 3500);

  const seoScore = analyzeSEO(generatedContent, input.title, input.focusKeyword, "blog");

  const suggestedSlug = buildSlugFromTitle(input.title);

  const suggestedMetaDescription = (await callOpenAI(buildMetaDescriptionPrompt(input.title, generatedContent, input.focusKeyword), 200)).trim();

  prisma.ai_contents
    .create({
      data: {
        type: "BLOG_POST",
        focusKeyword: input.focusKeyword,
        inputData: input as any,
        outputContent: generatedContent,
        seoScore: seoScore.overall,
        seoDetails: seoScore as any,
        createdBy,
      },
    })
    .catch((err) => console.error("[ai-content] DB save failed:", err));

  return {
    content: generatedContent,
    seoScore,
    suggestedTitle: input.title,
    suggestedSlug,
    suggestedMetaDescription,
  };
};

// ─── 4. Analyze SEO Only ─────────────────────────────────────
export const analyzeSEOOnly = (params: { content: string; title: string; focusKeyword: string; contentType: "product" | "blog" }): SEOScore => {
  return analyzeSEO(params.content, params.title, params.focusKeyword, params.contentType);
};

// ─── 5. Get History ──────────────────────────────────────────
export const getContentHistory = async (params: { type?: "PRODUCT_DESCRIPTION" | "BLOG_POST"; referenceId?: string; page?: number; limit?: number }) => {
  const { type, referenceId, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (type) where.type = type;
  if (referenceId) where.referenceId = referenceId;

  const [data, total] = await Promise.all([
    prisma.ai_contents.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        type: true,
        referenceId: true,
        focusKeyword: true,
        seoScore: true,
        createdAt: true,
        createdBy: true,
      },
    }),
    prisma.ai_contents.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const aiContentService = {
  generateProductDescription,
  generateProductDescriptionFromName,
  generateBlogPost,
  analyzeSEOOnly,
  getContentHistory,
};
