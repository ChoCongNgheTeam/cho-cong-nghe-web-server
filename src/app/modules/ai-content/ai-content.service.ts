import OpenAI from "openai";
import { env } from "@/config/env";
import prisma from "@/config/db";
import { GenerateProductDescriptionInput, GenerateBlogPostInput, GeneratedContent, SEOScore } from "./ai-content.types";
import { buildProductDescriptionPrompt, buildBlogPostPrompt, buildMetaDescriptionPrompt, buildSlugFromTitle } from "./prompts/content.prompts";
import { analyzeSEO } from "./seo.analyzer";

// ============================================================
// AI CONTENT SERVICE
// 2 tính năng chính:
// 1. generateProductDescription — viết mô tả sản phẩm từ thông số DB
// 2. generateBlogPost — viết bài blog từ tiêu đề + keyword
// + analyzeSEOOnly — check SEO nội dung đã có
// ============================================================

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY || process.env.OPENAI_API_KEY,
});

// Helper: call OpenAI với retry đơn giản
const callOpenAI = async (prompt: string, maxTokens: number): Promise<string> => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: maxTokens,
  });

  return response.choices[0].message.content || "";
};

// ─── 1. Generate Product Description ────────────────────────
export const generateProductDescription = async (input: GenerateProductDescriptionInput, createdBy: string): Promise<GeneratedContent> => {
  // Fetch product data từ DB
  const product = await prisma.products.findFirst({
    where: { id: input.productId, deletedAt: null },
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

  // Format specs by group
  const specGroups: Record<string, { name: string; value: string }[]> = {};
  for (const ps of product.productSpecifications) {
    const group = ps.specification.group || "Thông số khác";
    if (!specGroups[group]) specGroups[group] = [];
    specGroups[group].push({ name: ps.specification.name, value: ps.value });
  }

  // Format variants
  const variants = product.variants.map((v) => {
    const label = v.variantAttributes.map((va) => va.attributeOption.label).join(" / ") || "Mặc định";
    return { label, price: Number(v.price) };
  });

  // Build prompt & generate
  const prompt = buildProductDescriptionPrompt(input, {
    name: product.name,
    brand: product.brand.name,
    category: product.category.name,
    specifications: Object.entries(specGroups).map(([group, items]) => ({ group, items })),
    variants,
    existingDescription: product.description || undefined,
  });

  const generatedContent = await callOpenAI(prompt, 1200);

  // Analyze SEO
  const title = product.name;
  const seoScore = analyzeSEO(generatedContent, title, input.focusKeyword, "product");

  // Generate meta description
  const metaPrompt = buildMetaDescriptionPrompt(title, generatedContent, input.focusKeyword);
  const suggestedMetaDescription = await callOpenAI(metaPrompt, 200);

  // Save to DB
  await prisma.ai_contents.create({
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
  });

  return {
    content: generatedContent,
    seoScore,
    suggestedTitle: title,
    suggestedMetaDescription: suggestedMetaDescription.trim(),
  };
};

// ─── 2. Generate Blog Post ───────────────────────────────────
export const generateBlogPost = async (input: GenerateBlogPostInput, createdBy: string): Promise<GeneratedContent> => {
  const prompt = buildBlogPostPrompt(input);
  const generatedContent = await callOpenAI(prompt, 3000);

  // Analyze SEO
  const seoScore = analyzeSEO(generatedContent, input.title, input.focusKeyword, "blog");

  // Suggest slug
  const suggestedSlug = buildSlugFromTitle(input.title);

  // Generate meta description
  const metaPrompt = buildMetaDescriptionPrompt(input.title, generatedContent, input.focusKeyword);
  const suggestedMetaDescription = await callOpenAI(metaPrompt, 200);

  // Save to DB
  await prisma.ai_contents.create({
    data: {
      type: "BLOG_POST",
      focusKeyword: input.focusKeyword,
      inputData: input as any,
      outputContent: generatedContent,
      seoScore: seoScore.overall,
      seoDetails: seoScore as any,
      createdBy,
    },
  });

  return {
    content: generatedContent,
    seoScore,
    suggestedTitle: input.title,
    suggestedSlug,
    suggestedMetaDescription: suggestedMetaDescription.trim(),
  };
};

// ─── 3. Analyze SEO Only (không generate, chỉ check) ────────
export const analyzeSEOOnly = (params: { content: string; title: string; focusKeyword: string; contentType: "product" | "blog" }): SEOScore => {
  return analyzeSEO(params.content, params.title, params.focusKeyword, params.contentType);
};

// ─── 4. Get History ─────────────────────────────────────────
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
  generateBlogPost,
  analyzeSEOOnly,
  getContentHistory,
};
