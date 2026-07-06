import OpenAI from "openai";
import { env } from "@/config/env";
import { ChatMessage, ChatResponse, ProductCard } from "./chatbot.types";
import { memoryService } from "./memory.service";
import { CHATBOT_SYSTEM_PROMPT } from "./prompts/system.prompt";
import { CHATBOT_TOOLS } from "./tools/tool.definitions";
import {
  executeSearchProducts,
  executeGetProductDetail,
  executeGetActivePromotions,
  executeGetPolicy,
  extractProductCards,
  executeCompareProductsSpecs,
} from "./tools/tool.executor";

// ============================================================
// CHATBOT SERVICE
//
// Kiến trúc: Tool-calling loop
// 1. Gửi messages + tools → AI quyết định gọi tool nào
// 2. Backend thực thi tool → trả kết quả
// 3. Gửi lại kết quả cho AI → AI trả lời tự nhiên
// 4. Lặp lại nếu AI muốn gọi thêm tool (tối đa 3 vòng)
// ============================================================

import { executeWithGeminiRotation } from "@/utils/gemini.util";
import { generateEmbedding } from "./sync/embedding.sync";
import { rewriteQueryWithContext } from "./sync/rewriter.sync";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MAX_TOOL_ROUNDS = 3;

// ─── Dispatcher: routes tool name → executor ────────────────
const dispatchTool = async (
  name: string,
  args: Record<string, any>,
  userId?: string
): Promise<string> => {
  try {
    let result: any;

    switch (name) {
      case "search_products":
        result = await executeSearchProducts(args as any);
        break;
      case "compare_products":
        result = await executeCompareProductsSpecs(args.productNames);
        break;
      case "get_product_detail":
        result = await executeGetProductDetail(args as any);
        break;
      case "get_active_promotions":
        result = await executeGetActivePromotions(args as any);
        break;
      case "get_policy":
        result = await executeGetPolicy(args as any);
        break;
      case "save_user_preference":
        if (!userId) {
          result = { success: false, message: "Yêu cầu đăng nhập để lưu sở thích" };
        } else {
          const { PrismaClient } = require("@prisma/client");
          const prisma = new PrismaClient();
          await prisma.user_preferences.upsert({
            where: { userId_key: { userId, key: args.key } },
            update: { value: args.value, updatedAt: new Date() },
            create: { userId, key: args.key, value: args.value }
          });
          result = { success: true, message: "Đã lưu sở thích thành công" };
        }
        break;
      default:
        return JSON.stringify({ error: `Tool "${name}" không tồn tại` });
    }

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return JSON.stringify({
        found: false,
        message: "Không tìm thấy kết quả phù hợp",
      });
    }

    return JSON.stringify({ found: true, data: result });
  } catch (err) {
    console.error(`[chatbot] Tool "${name}" error:`, err);
    return JSON.stringify({
      found: false,
      error: "Lỗi khi tra cứu dữ liệu, vui lòng thử lại",
    });
  }
};

// ─── Main: getChatReply ──────────────────────────────────────
export const getChatReply = async (
  userMessages: ChatMessage[],
  sessionId?: string,
  userId?: string
): Promise<ChatResponse> => {
  const history = userMessages.slice(0, -1);
  const rawLastMessage = userMessages[userMessages.length - 1]?.content?.trim() || "";
  
  // VÒNG 0: Rewriter (Chuyển câu hỏi cụt lủn thành Standalone Query)
  let standaloneQuery = rawLastMessage;
  if (history.length > 0) {
    console.time("QueryRewriter");
    standaloneQuery = await rewriteQueryWithContext(history, rawLastMessage);
    console.timeEnd("QueryRewriter");
  }

  let currentEmbedding: number[] | null = null;
  if (standaloneQuery) {
    try {
      currentEmbedding = await generateEmbedding(standaloneQuery, 'query');
    } catch (e) {
      console.warn("[Chatbot] Lỗi generateEmbedding cho cache:", e);
    }
  }

  // 2. Tích hợp Trí nhớ Dài hạn và Hồ sơ (Tầng 2 & 3)
  let extraContext = "";
  if (sessionId) {
    const profileContext = await memoryService.getUserProfileContext(userId);
    const vectorContext = await memoryService.getVectorContext(sessionId, userId, rawLastMessage);
    extraContext = profileContext + "\n" + vectorContext;
  }

  // Lấy 20 messages gần nhất (10 turn = 10 user + 10 assistant)
  const recentMessages = userMessages.slice(-20);

  // contextMessages là array LOCAL cho mỗi request — không share state giữa các request
  // contextMessages là mảng lưu cấu trúc tin nhắn theo chuẩn Gemini (Native)
  const contextMessages: any[] = recentMessages.map((m) => {
    let text = m.content || "";
    if (m.role === "assistant" && m.products && Array.isArray(m.products) && m.products.length > 0) {
      const productNames = m.products.map((p: any) => p.name).join(", ");
      text += `\n(Ghi chú ẩn cho AI: Đã hiển thị UI các thẻ sản phẩm: ${productNames})`;
    }
    return {
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text }],
    };
  });

  const toolsUsed: string[] = [];
  const allToolCalls: any[] = [];
  const productCardMap = new Map<string, ProductCard>();
  let extractedPolicyNotes = "";
  let rounds = 0;

  while (rounds < MAX_TOOL_ROUNDS) {
    rounds++;

    let toolCalls: any[] = [];
    let assistantText = "";

    try {
      console.time(`GeminiRound${rounds}`);
      const response = await executeWithGeminiRotation(async (key) => {
        const body = {
          system_instruction: { parts: [{ text: CHATBOT_SYSTEM_PROMPT + extraContext }] },
          contents: contextMessages,
          tools: [{ functionDeclarations: CHATBOT_TOOLS }],
          generationConfig: { temperature: 0.4 },
        };

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          throw new Error(`${res.status} status code: ${await res.text()}`);
        }

        const data = await res.json();
        if (!data.candidates || data.candidates.length === 0) {
          console.error("GEMINI FULL DATA:", JSON.stringify(data, null, 2));
          throw new Error("Gemini returned an empty response.");
        }
        console.log("GEMINI CANDIDATE:", JSON.stringify(data.candidates[0], null, 2));
        return data.candidates[0].content;
      });
      console.timeEnd(`GeminiRound${rounds}`);

      // Lấy text và tool calls từ parts
      const parts = response.parts || [];
      for (const part of parts) {
        if (part.text) assistantText += part.text;
        if (part.functionCall) {
          toolCalls.push(part.functionCall);
          allToolCalls.push(part.functionCall);
        }
      }

      // ─── AI GUARDRAIL (LLM FAILSAFE) ───
      // Sửa lỗi Gemini 1.5 Flash đôi khi trả về mảng rỗng [] nếu bị mâu thuẫn system prompt
      if (toolCalls.length === 0 && !assistantText.trim()) {
        const msg = standaloneQuery.toLowerCase();
        if (msg.includes("khuyến mãi") || msg.includes("sale") || msg.includes("ưu đãi")) {
          const tc = { name: "get_active_promotions", args: {} };
          toolCalls.push(tc);
          allToolCalls.push(tc);
        } else if (msg.includes("bảo hành") || msg.includes("đổi trả") || msg.includes("chính sách")) {
          const tc = { name: "get_policy", args: {} };
          toolCalls.push(tc);
          allToolCalls.push(tc);
        }
      }

      // Lưu lại phản hồi của model vào context cho round tiếp theo
      contextMessages.push(response);

    } catch (err: any) {
      console.error("[Chatbot] Gemini API Error:", err.message || err);
      return {
        reply: "Xin lỗi bạn, hiện tại hệ thống AI đang quá tải do có quá nhiều người truy cập. Bạn vui lòng thử lại sau ít phút nhé!",
        toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined,
        products: productCardMap.size > 0 ? [...productCardMap.values()] : undefined,
      };
    }

    // ─── HYBRID CACHE LOOKUP ──────────────────────────────────
    const isAction = toolCalls.some(t => t.name === "save_user_preference");
    
    // Hash danh sách Tool Calls
    const toolSignatureString = JSON.stringify(toolCalls.map(t => ({ name: t.name, args: t.args || {} })));
    const toolSignatureHash = crypto.createHash('sha256').update(toolSignatureString).digest('hex');
    
    let cacheHitResponse: ChatResponse | null = null;
    
    if (!isAction && currentEmbedding) {
      try {
        const cached: any[] = await prisma.$queryRaw`
          SELECT response, (1 - (embedding <=> ${JSON.stringify(currentEmbedding)}::vector)) as score
          FROM chatbot_semantic_cache
          WHERE "toolSignatureHash" = ${toolSignatureHash}
            AND ("ttlDays" IS NULL OR "updatedAt" >= NOW() - ("ttlDays" * INTERVAL '1 day'))
          ORDER BY embedding <=> ${JSON.stringify(currentEmbedding)}::vector
          LIMIT 1
        `;
        
        if (cached.length > 0 && cached[0].score >= 0.90) {
          console.log(`[Chatbot] Hybrid Cache HIT! Score: ${cached[0].score.toFixed(3)} cho "${standaloneQuery}"`);
          cacheHitResponse = cached[0].response as ChatResponse;
          
          // Tăng biến đếm hitCount (Fire and forget)
          prisma.$executeRaw`
            UPDATE chatbot_semantic_cache 
            SET "hitCount" = "hitCount" + 1, "updatedAt" = NOW() 
            WHERE "toolSignatureHash" = ${toolSignatureHash} 
            AND response::text = ${JSON.stringify(cacheHitResponse)}::text
          `.catch(() => {});
        }
      } catch (err) {
        console.warn("[Chatbot] Lỗi tra cứu Hybrid Cache:", err);
      }
    }

    if (cacheHitResponse) {
      return cacheHitResponse;
    }

    // Không có tool call → AI đã có đủ thông tin để trả lời
    if (toolCalls.length === 0) {
      const products = productCardMap.size > 0 ? [...productCardMap.values()] : undefined;
      let finalReply = assistantText || "Xin lỗi, mình chưa nhận diện được yêu cầu này. Bạn có thể nói rõ hơn không?";
      const isPolicy = toolsUsed.includes("get_policy") && !toolsUsed.includes("search_products");

      if (isPolicy && extractedPolicyNotes) {
        finalReply += "\n\n---\n" + extractedPolicyNotes.split("\n").map(line => `> ${line}`).join("\n");
      }

      const result = {
        reply: finalReply,
        toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined,
        products,
      };

      if (!isAction && currentEmbedding) {
        prisma.$executeRaw`
          INSERT INTO chatbot_semantic_cache (id, query, embedding, "toolSignatureHash", "ttlDays", response, "hitCount", "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), ${standaloneQuery}, ${JSON.stringify(currentEmbedding)}::vector, ${toolSignatureHash}, null, ${JSON.stringify(result)}::jsonb, 0, NOW(), NOW())
        `.catch(e => console.warn("[Chatbot] Lỗi lưu Cache (No tool):", e));
      }

      return result;
    }

    // Thực thi các tool call đồng thời
    console.time(`ToolExecutionRound${rounds}`);
    const toolResponsesParts = await Promise.all(
      toolCalls.map(async (toolCall) => {
        let args: Record<string, any> = toolCall.args || {};
        
        const result = await dispatchTool(toolCall.name, args, userId);
        toolsUsed.push(toolCall.name);

        if (toolCall.name === "get_policy") {
          try {
            const parsed = JSON.parse(result);
            if (parsed?.data?.exactNotes) {
              extractedPolicyNotes += parsed.data.exactNotes + "\n";
            }
          } catch (e) {}
        }

        // Extract product cards từ tool result và tích lũy vào map
        const cards = extractProductCards(toolCall.name, result);
        cards.forEach((c) => productCardMap.set(c.id, c));

        let parsedResult: any = result;
        try {
          parsedResult = typeof result === "string" ? JSON.parse(result) : result;
        } catch (e) {}

        return {
          functionResponse: {
            name: toolCall.name,
            response: parsedResult,
          },
        };
      })
    );
    console.timeEnd(`ToolExecutionRound${rounds}`);

    // Gemini yêu cầu tool response phải gói trong role "user"
    contextMessages.push({
      role: "user",
      parts: toolResponsesParts,
    });

    // ─── HYBRID SHORT-CIRCUIT ──────────────────────────────────
    // Nếu chỉ gọi tool sản phẩm (không gọi policy/promotions), ngắt vòng lặp ngay để đạt < 5s
    // Ngoại trừ trường hợp KHÁCH YÊU CẦU SO SÁNH: Con AI gọi tool compare_products.
    const isCompare = toolCalls.some(t => t.name === "compare_products");
    const requiresRound2 = toolsUsed.includes("get_policy") || toolsUsed.includes("get_active_promotions") || isCompare;
    
    if (!requiresRound2) {
      const products =
        productCardMap.size > 0 ? [...productCardMap.values()] : undefined;
      return {
        reply: products
          ? `Dưới đây là các sản phẩm phù hợp với yêu cầu của bạn (${products.map(p => p.name).join(", ")}):`
          : "Xin lỗi, mình chưa tìm thấy thông tin phù hợp cho yêu cầu này.",
        toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined,
        products,
      };
    } else {
      break;
    }
  }

  // Vượt quá MAX_TOOL_ROUNDS hoặc chạy Round 2 cho Policy
  const isPolicy = toolsUsed.includes("get_policy");
  let systemInstructionOverride = CHATBOT_SYSTEM_PROMPT + extraContext;

  if (isPolicy) {
    systemInstructionOverride = `Bạn là trợ lý ảo cung cấp chính sách của Chợ Công Nghệ.
Khi khách hàng hỏi về chính sách, bạn phải tuân thủ:
1. Nếu khách hỏi CHUNG CHUNG: Hãy tóm tắt ngắn gọn, thân thiện và dễ hiểu các quyền lợi chính.
2. Nếu khách hỏi CỤ THỂ (ví dụ: rơi vỡ có bảo hành không): Trích xuất đúng ý trả lời ngắn gọn, đi thẳng vào vấn đề.`;
  }

  try {
    const finalResponseText = await executeWithGeminiRotation(async (key) => {
      const finalContextMessages = [...contextMessages];
      finalContextMessages.push({
        role: "user",
        parts: [{ text: isPolicy ? "Dựa vào tài liệu, hãy trả lời khách hàng ngắn gọn, tự nhiên, thân thiện." : "Hãy trả lời khách hàng ngắn gọn, tự nhiên, thân thiện." }]
      });

      const body = {
        system_instruction: { parts: [{ text: systemInstructionOverride }] },
        contents: finalContextMessages,
        generationConfig: { temperature: isPolicy ? 0.2 : 0.7, maxOutputTokens: 4000 },
      };

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`${res.status} status code: ${await res.text()}`);

      const data = await res.json();
      if (!data.candidates || data.candidates.length === 0) throw new Error("Gemini returned an empty response in Round 2.");
      return data.candidates[0].content.parts.map((p: any) => p.text).join("");
    });

    let finalReply = finalResponseText ||
      "Xin lỗi bạn, hiện tại mình chưa hiểu rõ yêu cầu này. Bạn có thể nói rõ hơn được không?";

    // Unconditionally append exact legal notes if policy tool was used
    if (isPolicy && extractedPolicyNotes) {
      finalReply += "\n\n---\n" + extractedPolicyNotes.split("\n").map(line => `> ${line}`).join("\n");
    } else if (isPolicy) {
      console.log("[Chatbot] isPolicy is true but extractedPolicyNotes is empty!");
    }

    const result = {
      reply: finalReply,
      toolsUsed,
      products: productCardMap.size > 0 ? [...productCardMap.values()] : undefined,
    };

    // 4. Fire-and-forget: Cập nhật Trí nhớ Ngắn hạn và Dài hạn
    if (sessionId) {
      const updatedMessages: ChatMessage[] = [
        ...userMessages,
        { role: "assistant", content: finalReply }
      ];
      memoryService.saveSession(sessionId, userId, updatedMessages).catch(e => console.error("[memory] Save Session Error:", e));
      memoryService.processBackgroundMemory(sessionId, userId, updatedMessages).catch(e => console.error("[memory] Vectorize Error:", e));
    }

    // Lưu vào Ngân hàng Câu hỏi
    const isActionTool = toolsUsed.some(t => t === "save_user_preference");
    if (!isActionTool && currentEmbedding) {
      const isVolatile = toolsUsed.some(t => t === "get_product_detail" || t === "get_active_promotions");
      const ttlDays = isVolatile ? 1 : null;

      const finalToolSignatureString = JSON.stringify(allToolCalls.map(t => ({ name: t.name, args: t.args || {} })));
      const finalToolSignatureHash = crypto.createHash('sha256').update(finalToolSignatureString).digest('hex');
      
      prisma.$executeRaw`
        INSERT INTO chatbot_semantic_cache (id, query, embedding, "toolSignatureHash", "ttlDays", response, "hitCount", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${standaloneQuery}, ${JSON.stringify(currentEmbedding)}::vector, ${finalToolSignatureHash}, ${ttlDays}, ${JSON.stringify(result)}::jsonb, 0, NOW(), NOW())
      `.catch(e => console.warn("[Chatbot] Lỗi lưu Cache (Round 2):", e));
    }

    return result;
  } catch (err: any) {
    console.error("[Chatbot] Final Response Error:", err.message || err);
    return {
      reply:
        "Xin lỗi bạn, hiện tại hệ thống đang xử lý quá nhiều yêu cầu nên phản hồi hơi chậm. Bạn vui lòng thử lại sau ít phút nhé!",
      toolsUsed,
      products:
        productCardMap.size > 0 ? [...productCardMap.values()] : undefined,
    };
  }
};

export const chatbotService = { getChatReply };
