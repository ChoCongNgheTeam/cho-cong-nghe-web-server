// ============================================================
// aiCompare.service.ts
// Core logic: fetch DB → transform → call OpenAI → return result
//
// Dùng NotFoundError / BadRequestError từ @/errors (khớp product.service.ts)
// ============================================================

import OpenAI from "openai";
import { findProductsForAICompare } from "./ai-compare.repository";
import {
  transformProductSpecs,
  ProductForAI,
} from "./transform.product.specs";
import {
  COMPARE_SYSTEM_PROMPT,
  buildCompareUserPrompt,
} from "./prompt/compare.prompt";
import { AICompareResult, CompareAIResult } from "./ai-compare.types";
import { NotFoundError, BadRequestError } from "@/errors";

// ─── OpenAI client (singleton) ────────────────────────────────────────────────

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ─── Step 1: Fetch + validate ─────────────────────────────────────────────────

async function fetchAndValidate(productIds: string[]): Promise<ProductForAI[]> {
  const products = await findProductsForAICompare(productIds);

  // Kiểm tra tất cả IDs có tồn tại không
  if (products.length !== productIds.length) {
    const foundIds = new Set(products.map((p: ProductForAI) => p.id));
    const missingIds = productIds.filter((id) => !foundIds.has(id));
    throw new NotFoundError(
      `Không tìm thấy sản phẩm với ID: ${missingIds.join(", ")}`
    );
  }

  // Kiểm tra sản phẩm có specs không
  const noSpecsProducts = products.filter(
    (p: ProductForAI) => p.productSpecifications.length === 0
  );
  if (noSpecsProducts.length > 0) {
    throw new BadRequestError(
      `Các sản phẩm sau chưa có thông số kỹ thuật: ${noSpecsProducts.map((p: ProductForAI) => p.name).join(", ")}`
    );
  }

  return products;
}

// ─── Step 2: Call OpenAI ──────────────────────────────────────────────────────

async function callOpenAI(payloads: ReturnType<typeof transformProductSpecs>[]): Promise<CompareAIResult> {
  const aiPayloads = payloads.map((p) => p.payload);
  const userPrompt = buildCompareUserPrompt(aiPayloads);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,       // thấp để output nhất quán
    response_format: { type: "json_object" }, // force JSON mode — không bao giờ trả markdown
    messages: [
      { role: "system", content: COMPARE_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  });

  const rawText = response.choices[0]?.message?.content;
  if (!rawText) {
    throw new Error("OpenAI không trả về nội dung");
  }

  try {
    return JSON.parse(rawText) as CompareAIResult;
  } catch {
    throw new Error(
      `Không thể parse JSON từ OpenAI: ${rawText.slice(0, 300)}`
    );
  }
}

// ─── Main Service ─────────────────────────────────────────────────────────────

/**
 * compareProductsWithAI
 *
 * Flow:
 *   productIds
 *     → Prisma query (products + brand + variants + productSpecifications + specification)
 *     → transform: flatten specs, resolve giá default variant
 *     → OpenAI gpt-4o-mini (json_object mode)
 *     → parse CompareAIResult
 *     → build AICompareResult { products metadata + aiAnalysis }
 */
export async function compareProductsWithAI(
  productIds: string[]
): Promise<AICompareResult> {
  // 1. Fetch từ DB + validate
  const rawProducts = await fetchAndValidate(productIds);

  // 2. Transform (giữ thứ tự theo productIds)
  const transformed = rawProducts.map(transformProductSpecs);

  // 3. Call OpenAI
  const aiAnalysis = await callOpenAI(transformed);

  // 4. Build response
  return {
    products: transformed.map((t: ReturnType<typeof transformProductSpecs>) => t.meta),
    aiAnalysis,
  };
}