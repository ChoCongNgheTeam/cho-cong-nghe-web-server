import OpenAI from "openai";
import { env } from "@/config/env";
import prisma from "@/config/db";
import { GenerateProductDescriptionInput, GenerateBlogPostInput, GeneratedContent, SEOScore } from "./ai-content.types";
import { buildProductDescriptionPrompt, buildProductDescriptionPromptFromName, buildBlogPostPrompt, buildMetaDescriptionPrompt, buildSlugFromTitle } from "./prompts/content.prompts";
import { analyzeSEO } from "./seo.analyzer";
import type { SuggestSpecificationsInput } from "./ai-content.validation";
import multer from "multer";
import * as XLSX from "xlsx";
import { parse as csvParse } from "csv-parse/sync";

// ============================================================
// AI CONTENT SERVICE
// ============================================================

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  timeout: 180_000,
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
    specifications: Object.entries(specGroups).map(([group, items]) => ({ group, items })),
    variants,
    existingDescription: product.description || undefined,
  };
};

// ─── 1. Generate Product Description (có productId) ──────────
export const generateProductDescription = async (input: GenerateProductDescriptionInput, createdBy: string): Promise<GeneratedContent> => {
  const productData = await fetchProductData(input.productId!);

  const prompt = buildProductDescriptionPrompt(input, productData);
  const generatedContent = await callOpenAI(prompt, 1500);

  const seoScore = analyzeSEO(generatedContent, productData.name, input.focusKeyword, "product");
  const suggestedMetaDescription = (await callOpenAI(buildMetaDescriptionPrompt(productData.name, generatedContent, input.focusKeyword), 200)).trim();

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

  return { content: generatedContent, seoScore, suggestedTitle: productData.name, suggestedMetaDescription };
};

// ─── 2. Generate Product Description (KHÔNG có productId) ────
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

  return { content: generatedContent, seoScore, suggestedTitle: input.productName, suggestedMetaDescription };
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

  return { content: generatedContent, seoScore, suggestedTitle: input.title, suggestedSlug, suggestedMetaDescription };
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

// ─── buildSuggestSpecsPrompt (internal) ─────────────────────
// ─── Prompt builder (cho từng chunk) ────────────────────────
const buildSuggestSpecsPrompt = (productName: string, specs: Array<{ specificationId: string; name: string; group?: string; unit?: string | null }>): string => {
  const specList = specs
    .map((s) => {
      const unitHint = s.unit ? ` (đơn vị: ${s.unit})` : "";
      const groupHint = s.group ? ` [nhóm: ${s.group}]` : "";
      return `- id="${s.specificationId}" | tên="${s.name}"${groupHint}${unitHint}`;
    })
    .join("\n");

  return `Bạn là chuyên gia về sản phẩm công nghệ. Dựa vào tên sản phẩm sau, hãy điền giá trị hợp lý cho từng thông số kỹ thuật.
 
## SẢN PHẨM
${productName}
 
## DANH SÁCH THÔNG SỐ CẦN ĐIỀN
${specList}
 
## YÊU CẦU
- Với mỗi thông số, hãy suy luận giá trị dựa trên tên sản phẩm
- Nếu không thể suy luận được, trả về value là null
- Giá trị phải thực tế, không bịa số liệu không có căn cứ
- Giá trị KHÔNG bao gồm đơn vị (đơn vị đã có trong field "unit")
- Trả về JSON object với key là specificationId, value là string hoặc null
 
## QUAN TRỌNG
- Chỉ trả về JSON thuần, không markdown, không giải thích
- Key phải là specificationId đúng như đã cho
- Với thông số không suy luận được: value = null (KHÔNG bỏ key)`;
};

// ─── Parse JSON an toàn — xử lý cả truncated JSON ───────────
// Khi max_tokens bị cắt ngang, JSON có dạng:
//   { "id1": "val1", "id2": "val ← bị cắt ở đây
// Ta cố gắng thu hồi các cặp key-value đã hoàn chỉnh.
const safeParseSpecJson = (raw: string): Record<string, string | null> => {
  // Bước 1: clean markdown fences
  const cleaned = raw
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  // Bước 2: thử parse bình thường trước
  try {
    const parsed = JSON.parse(cleaned);
    if (typeof parsed === "object" && parsed !== null) return parsed;
  } catch {
    // tiếp tục sang recovery
  }

  // Bước 3: partial recovery — extract các cặp đã hoàn chỉnh bằng regex
  // Match: "uuid": "value" hoặc "uuid": null
  const recovered: Record<string, string | null> = {};
  const pairRegex = /"([0-9a-f-]{36})"\s*:\s*(?:"((?:[^"\\]|\\.)*)"|null)/gi;
  let match: RegExpExecArray | null;
  while ((match = pairRegex.exec(cleaned)) !== null) {
    recovered[match[1]] = match[2] !== undefined ? match[2] : null;
  }

  if (Object.keys(recovered).length > 0) {
    console.warn(`[ai-content] JSON truncated, recovered ${Object.keys(recovered).length} entries via regex`);
    return recovered;
  }

  // Bước 4: thử auto-close JSON bị cắt
  // Tìm vị trí dấu phẩy hoặc : cuối cùng và cắt tại đó rồi đóng ngoặc
  try {
    const lastClean = cleaned.replace(/,\s*$/, "").replace(/,\s*"[^"]*"\s*:\s*[^,}]*$/, "");
    const closed = lastClean.endsWith("}") ? lastClean : lastClean + "}";
    const parsed = JSON.parse(closed);
    if (typeof parsed === "object" && parsed !== null) {
      console.warn(`[ai-content] JSON auto-closed, recovered ${Object.keys(parsed).length} entries`);
      return parsed;
    }
  } catch {
    // bỏ qua
  }

  console.error("[ai-content] JSON parse failed completely:", cleaned.slice(0, 300));
  return {};
};

// ─── Token budget per spec ───────────────────────────────────
// UUID (36) + value (~40 chars) + JSON syntax ≈ ~30 tokens/spec
// Thêm 200 tokens buffer cho prompt overhead
const TOKENS_PER_SPEC = 35;
const PROMPT_OVERHEAD = 300;
const MAX_TOKENS_CAP = 4000; // gpt-4o-mini max output safe limit

const calcMaxTokens = (specCount: number): number => Math.min(PROMPT_OVERHEAD + specCount * TOKENS_PER_SPEC, MAX_TOKENS_CAP);

// ─── Chunk size: ~20 specs/batch là điểm ngọt nhất ──────────
// - Đủ nhỏ để không bị cắt token
// - Đủ lớn để không spam quá nhiều requests
const CHUNK_SIZE = 20;

// ─── 6. Suggest Specifications (chunked) ─────────────────────
export const suggestSpecifications = async (
  input: SuggestSpecificationsInput,
): Promise<{
  suggestions: Record<string, string | null>;
  filledCount: number;
  productName: string;
  chunksUsed: number;
}> => {
  const { productName, specifications } = input;
  const validIds = new Set(specifications.map((s) => s.specificationId));

  // Chia specs thành chunks
  const chunks: (typeof specifications)[] = [];
  for (let i = 0; i < specifications.length; i += CHUNK_SIZE) {
    chunks.push(specifications.slice(i, i + CHUNK_SIZE));
  }

  console.log(`[ai-content] suggestSpecifications: ${specifications.length} specs → ${chunks.length} chunks`);

  // Gọi song song tất cả chunks
  const chunkResults = await Promise.allSettled(
    chunks.map(async (chunk, idx) => {
      const prompt = buildSuggestSpecsPrompt(productName, chunk);
      const maxTokens = calcMaxTokens(chunk.length);

      console.log(`[ai-content] chunk ${idx + 1}/${chunks.length}: ${chunk.length} specs, maxTokens=${maxTokens}`);

      const raw = await callOpenAI(prompt, maxTokens);
      return safeParseSpecJson(raw);
    }),
  );

  // Merge kết quả từ tất cả chunks
  const suggestions: Record<string, string | null> = {};

  for (let i = 0; i < chunkResults.length; i++) {
    const result = chunkResults[i];
    if (result.status === "fulfilled") {
      const parsed = result.value;
      for (const [k, v] of Object.entries(parsed)) {
        if (validIds.has(k)) {
          suggestions[k] = typeof v === "string" && v.trim() ? v.trim() : null;
        }
      }
    } else {
      console.error(`[ai-content] chunk ${i + 1} failed:`, result.reason?.message);
    }
  }

  const filledCount = Object.values(suggestions).filter((v) => v !== null).length;

  console.log(`[ai-content] suggestSpecifications done: ${filledCount}/${specifications.length} filled`);

  return {
    suggestions,
    filledCount,
    productName,
    chunksUsed: chunks.length,
  };
};

// ─── Walk up category tree để tìm specs ─────────────────────
// Specs có thể được define ở node cha (shared template).
// VD: MacBook Pro 16 inch (ec11a...) → cha là Apple (Macbook) (864fa...)
//     → cha là Laptop (93443...) — specs định nghĩa ở đây
//
// Thuật toán: query từ categoryId hiện tại, nếu không có specs
// thì lấy parentId rồi thử lại, cho đến khi tìm thấy hoặc hết tree.
const findSpecsWalkingUp = async (categoryId: string) => {
  let currentId: string | null = categoryId;
  const visited: string[] = [];

  while (currentId) {
    visited.push(currentId);

    const specs = await prisma.category_specifications.findMany({
      where: { categoryId: currentId },
      include: {
        specification: {
          select: { name: true, group: true, unit: true, isRequired: true },
        },
      },
      orderBy: [{ specification: { group: "asc" } }, { sortOrder: "asc" }],
    });

    if (specs.length > 0) {
      console.log(`[getSpecTemplate] found ${specs.length} specs at categoryId=${currentId}` + (currentId !== categoryId ? ` (walked up from ${categoryId})` : ""));
      return { specs, resolvedCategoryId: currentId };
    }

    // Chưa có → lấy parentId
    const cat: { parentId: string | null } | null = await prisma.categories.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    });

    currentId = cat?.parentId ?? null;
  }

  console.warn(`[getSpecTemplate] no specs found, visited: ${visited.join(" → ")}`);
  return { specs: [], resolvedCategoryId: null };
};

// ─── 7. Get Spec Template (XLSX buffer) ──────────────────────
export interface SpecTemplateResult {
  buffer: Buffer;
  filename: string;
}

export const getSpecTemplate = async (categoryId: string): Promise<SpecTemplateResult> => {
  const { specs, resolvedCategoryId } = await findSpecsWalkingUp(categoryId);

  if (specs.length === 0) {
    throw Object.assign(new Error("Không tìm thấy thông số kỹ thuật cho danh mục này hoặc danh mục cha"), { statusCode: 404 });
  }

  const wb = XLSX.utils.book_new();

  // Sheet 1: Spec IDs (tham chiếu)
  const specRows = specs.map((s) => ({
    "spec_id (UUID)": s.specificationId,
    "name (tên thông số)": s.specification.name,
    "group (nhóm)": s.specification.group ?? "",
    "unit (đơn vị)": s.specification.unit ?? "",
    is_required: s.specification.isRequired ? "TRUE" : "FALSE",
  }));
  const wsIds = XLSX.utils.json_to_sheet(specRows);
  wsIds["!cols"] = [{ wch: 40 }, { wch: 28 }, { wch: 22 }, { wch: 14 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsIds, "Spec IDs (he thong)");

  // Sheet 2: Template để import
  const importRows = specs.map((s) => ({
    spec_id: s.specificationId,
    value: "",
    group: s.specification.group ?? "",
    name: s.specification.name,
    unit: s.specification.unit ?? "",
    is_highlight: "FALSE",
  }));
  const wsImport = XLSX.utils.json_to_sheet(importRows);
  wsImport["!cols"] = [{ wch: 40 }, { wch: 44 }, { wch: 18 }, { wch: 22 }, { wch: 12 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsImport, "Du lieu import");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

  // Dùng resolvedCategoryId (node có specs thật) trong filename
  const filenameId = (resolvedCategoryId ?? categoryId).slice(0, 8);
  return {
    buffer,
    filename: `spec-template-${filenameId}.xlsx`,
  };
};

// ─── Multer config — memory storage ─────────────────────────
// QUAN TRỌNG: uploadSpec phải được dùng TRƯỚC khi body được parse
// bởi express.json() global. Đặt multer middleware TRƯỚC auth nếu cần,
// hoặc đảm bảo route import-specifications không bị global bodyParser
// can thiệp trước khi multer chạy.
export const uploadSpec = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel", "text/csv", "text/plain"];
    const extOk = /\.(xlsx|xls|csv)$/i.test(file.originalname);
    if (allowed.includes(file.mimetype) || extOk) cb(null, true);
    else cb(new Error("Chỉ hỗ trợ file .xlsx, .xls, .csv"));
  },
});

// ─── Parse spec file ─────────────────────────────────────────
export interface ParsedSpecRow {
  spec_id: string;
  value: string;
  is_highlight?: boolean;
  name?: string;
  group?: string;
  unit?: string;
}

export interface ImportParseResult {
  rows: ParsedSpecRow[];
  skippedCount: number;
  totalRows: number;
  errors: string[];
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const parseSpecFile = (buffer: Buffer, filename: string): ImportParseResult => {
  const errors: string[] = [];
  let rawRows: Record<string, string>[] = [];

  try {
    const isCsv = /\.csv$/i.test(filename);
    if (isCsv) {
      const text = buffer.toString("utf-8");
      rawRows = csvParse(text, { columns: true, skip_empty_lines: true, trim: true, bom: true }) as Record<string, string>[];
    } else {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const targetSheet = workbook.SheetNames.find((n) => n.toLowerCase().includes("du lieu") || n.toLowerCase().includes("import")) ?? workbook.SheetNames[0];
      const ws = workbook.Sheets[targetSheet];
      rawRows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { header: undefined, defval: "", raw: false });
    }
  } catch (err: any) {
    errors.push(`Không thể đọc file: ${err.message}`);
    return { rows: [], skippedCount: 0, totalRows: 0, errors };
  }

  const totalRows = rawRows.length;
  const rows: ParsedSpecRow[] = [];
  let skippedCount = 0;

  for (const raw of rawRows) {
    const norm: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw)) {
      norm[k.toLowerCase().trim()] = String(v ?? "").trim();
    }

    const specId = norm["spec_id"] ?? norm["specificationid"] ?? norm["specification_id"] ?? "";
    const value = norm["value"] ?? norm["gia_tri"] ?? norm["giá trị"] ?? "";

    if (!specId || !value) {
      skippedCount++;
      continue;
    }
    if (!UUID_RE.test(specId)) {
      errors.push(`spec_id không hợp lệ: "${specId.slice(0, 40)}" — phải là UUID`);
      skippedCount++;
      continue;
    }

    const isHighlightRaw = (norm["is_highlight"] ?? "false").toLowerCase();
    rows.push({
      spec_id: specId,
      value,
      is_highlight: isHighlightRaw === "true" || isHighlightRaw === "1",
      name: norm["name"] ?? norm["tên thông số"] ?? undefined,
      group: norm["group"] ?? norm["nhóm"] ?? undefined,
      unit: norm["unit"] ?? norm["đơn vị"] ?? undefined,
    });
  }

  return { rows, skippedCount, totalRows, errors };
};

// ─── Validate spec_ids với category ──────────────────────────
export const validateSpecIds = async (specIds: string[], categoryId: string): Promise<{ valid: string[]; invalid: string[] }> => {
  const { specs } = await findSpecsWalkingUp(categoryId);
  const validSet = new Set(specs.map((s) => s.specificationId));
  return {
    valid: specIds.filter((id) => validSet.has(id)),
    invalid: specIds.filter((id) => !validSet.has(id)),
  };
};

// ─── Import Specifications ────────────────────────────────────
export const importSpecifications = async (fileBuffer: Buffer, filename: string, categoryId: string): Promise<{ parsed: ImportParseResult; validRows: ParsedSpecRow[]; invalidSpecIds: string[] }> => {
  const parsed = parseSpecFile(fileBuffer, filename);

  if (parsed.rows.length === 0) {
    return { parsed, validRows: [], invalidSpecIds: [] };
  }

  const specIds = parsed.rows.map((r) => r.spec_id);
  const { valid, invalid } = await validateSpecIds(specIds, categoryId);
  const validSet = new Set(valid);
  const validRows = parsed.rows.filter((r) => validSet.has(r.spec_id));

  if (invalid.length > 0) {
    parsed.errors.push(`${invalid.length} spec_id không thuộc danh mục này (sẽ bị bỏ qua): ${invalid.slice(0, 3).join(", ")}${invalid.length > 3 ? "..." : ""}`);
  }

  return { parsed, validRows, invalidSpecIds: invalid };
};

export const aiContentService = {
  generateProductDescription,
  generateProductDescriptionFromName,
  generateBlogPost,
  analyzeSEOOnly,
  getContentHistory,
  suggestSpecifications,
  getSpecTemplate,
  importSpecifications,
};
