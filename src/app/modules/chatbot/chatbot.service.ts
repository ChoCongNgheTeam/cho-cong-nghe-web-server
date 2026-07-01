import OpenAI from "openai";
import { env } from "@/config/env";
import { ChatMessage, ChatResponse, ProductCard } from "./chatbot.types";
import { CHATBOT_SYSTEM_PROMPT } from "./prompts/system.prompt";
import { CHATBOT_TOOLS } from "./tools/tool.definitions";
import {
  executeSearchProducts,
  executeGetProductDetail,
  executeGetActivePromotions,
  executeGetPolicy,
  extractProductCards,
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

import { executeWithGroqRotation } from "@/utils/groq.util";

const MAX_TOOL_ROUNDS = 3;

// ─── FAQ Cache (Question Bank) ──────────────────────────────
// Lưu trữ các câu trả lời chính sách tĩnh để tránh gọi lại LLM (giúp tốc độ < 100ms)
const policyCache = new Map<string, ChatResponse>();
const MAX_CACHE_SIZE = 500;

// ─── Dispatcher: routes tool name → executor ────────────────
const dispatchTool = async (
  name: string,
  args: Record<string, any>,
): Promise<string> => {
  try {
    let result: any;

    switch (name) {
      case "search_products":
        result = await executeSearchProducts(args as any);
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
): Promise<ChatResponse> => {
  const isStandalone = userMessages.length <= 2;
  const lastMessage = userMessages[userMessages.length - 1]?.content?.trim().toLowerCase();

  // 1. Kiểm tra Question Bank (Cache) cho các câu hỏi FAQs phổ biến
  if (isStandalone && lastMessage && policyCache.has(lastMessage)) {
    console.log("[Chatbot] FAQ Cache HIT for:", lastMessage);
    return policyCache.get(lastMessage)!;
  }

  // Lấy 20 messages gần nhất (10 turn = 10 user + 10 assistant)
  const recentMessages = userMessages.slice(-20);

  // contextMessages là array LOCAL cho mỗi request — không share state giữa các request
  const contextMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
    [
      { role: "system", content: CHATBOT_SYSTEM_PROMPT },
      ...recentMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

  const toolsUsed: string[] = [];
  // Tích lũy product cards xuyên suốt tất cả rounds
  // Dùng Map để tự dedup by id (AI có thể gọi search + detail cùng 1 SP)
  const productCardMap = new Map<string, ProductCard>();
  let extractedPolicyNotes = "";
  let rounds = 0;

  while (rounds < MAX_TOOL_ROUNDS) {
    rounds++;

    let message: OpenAI.Chat.Completions.ChatCompletionMessage;

    try {
      console.time(`GroqRound${rounds}`);
      const response = await executeWithGroqRotation(async (client) => {
        const res = await client.chat.completions.create({
          model: "gemini-2.5-flash",
          messages: contextMessages,
          tools: CHATBOT_TOOLS,
          tool_choice: "auto",
          parallel_tool_calls: false,
          temperature: 0.7,
          max_tokens: 1000,
        });

        const msg = res.choices[0]?.message;
        if (!msg?.content && (!msg?.tool_calls || msg.tool_calls.length === 0)) {
          throw new Error("Gemini returned an empty response (Empty content + No tool calls). Retrying...");
        }
        return res;
      });
      console.timeEnd(`GroqRound${rounds}`);
      message = response.choices[0].message;
    } catch (err: any) {
      if (err.code === "tool_use_failed" && err.error?.failed_generation) {
        console.warn(
          "[Chatbot] Groq tool_use_failed bug detected. Self-healing...",
        );
        const failedStr = err.error.failed_generation as string;
        const match = failedStr.match(
          /<function=([a-zA-Z0-9_]+)[^>\{]*({.*?})(?:<\/function>|$)/s,
        );

        if (match) {
          const fnName = match[1].trim();
          const fnArgs = match[2].trim();
          message = {
            role: "assistant",
            content: null,
            tool_calls: [
              {
                id: `call_recovered_${Date.now()}`,
                type: "function",
                function: {
                  name: fnName,
                  arguments: fnArgs,
                },
              },
            ],
          } as any;
        } else {
          throw err;
        }
      } else {
        console.error("[Chatbot] Groq API Error:", err.message || err);
        return {
          reply:
            "Xin lỗi bạn, hiện tại hệ thống AI đang quá tải do có quá nhiều người truy cập. Bạn vui lòng thử lại sau ít phút hoặc liên hệ Hotline 1800.6060 nhé!",
          toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined,
          products:
            productCardMap.size > 0 ? [...productCardMap.values()] : undefined,
        };
      }
    }

    // Không có tool call → AI đã có đủ thông tin để trả lời
    if (!message.tool_calls || message.tool_calls.length === 0) {
      const products =
        productCardMap.size > 0 ? [...productCardMap.values()] : undefined;

      let finalReply = message.content || "Xin lỗi, mình không hiểu câu hỏi. Bạn có thể nói rõ hơn không?";
      const isPolicy = toolsUsed.includes("get_policy") && !toolsUsed.includes("search_products");

      if (isPolicy && extractedPolicyNotes) {
        finalReply += "\n\n---\n" + extractedPolicyNotes.split("\n").map(line => `> ${line}`).join("\n");
      }

      const result = {
        reply: finalReply,
        toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined,
        products,
      };

      if (isStandalone && lastMessage && isPolicy) {
        if (policyCache.size >= MAX_CACHE_SIZE) policyCache.clear();
        policyCache.set(lastMessage, result);
        console.log("[Chatbot] Saved to FAQ Cache:", lastMessage);
      }

      return result;
    }

    // Push assistant message (có tool_calls) vào context của round này
    contextMessages.push(message);

    console.time(`ToolExecutionRound${rounds}`);
    const toolResults = await Promise.all(
      message.tool_calls.map(async (toolCall) => {
        if (!("function" in toolCall)) {
          return {
            role: "tool" as const,
            tool_call_id: toolCall.id,
            content: JSON.stringify({
              found: false,
              error: "Tool call không hợp lệ",
            }),
          };
        }

        let args: Record<string, any> = {};
        try {
          args = JSON.parse(toolCall.function.arguments || "{}");
        } catch {
          return {
            role: "tool" as const,
            tool_call_id: toolCall.id,
            content: JSON.stringify({
              found: false,
              error: "Arguments không hợp lệ",
            }),
          };
        }

        const result = await dispatchTool(toolCall.function.name, args);
        toolsUsed.push(toolCall.function.name);

        if (toolCall.function.name === "get_policy") {
          try {
            const parsed = JSON.parse(result);
            if (parsed?.data?.exactNotes) {
              extractedPolicyNotes = parsed.data.exactNotes;
              console.log("[Chatbot] Extracted Policy Notes Length:", extractedPolicyNotes.length);
            } else {
              console.log("[Chatbot] No exactNotes found in parsed result!");
            }
          } catch (e) {
            console.error("[Chatbot] Failed to parse policy result", e);
          }
        }

        // Extract product cards từ tool result và tích lũy vào map (tự dedup by id)
        const cards = extractProductCards(toolCall.function.name, result);
        cards.forEach((c) => productCardMap.set(c.id, c));

        return {
          role: "tool" as const,
          tool_call_id: toolCall.id,
          content: result,
        };
      }),
    );
    console.timeEnd(`ToolExecutionRound${rounds}`);

    contextMessages.push(...toolResults);

    // ─── HYBRID SHORT-CIRCUIT ──────────────────────────────────
    // Nếu chỉ gọi tool sản phẩm/khuyến mãi (không gọi policy), ngắt vòng lặp ngay để đạt < 5s
    const requiresRound2 = toolsUsed.includes("get_policy");
    if (!requiresRound2) {
      const products =
        productCardMap.size > 0 ? [...productCardMap.values()] : undefined;
      return {
        reply: products
          ? "Dưới đây là các sản phẩm phù hợp với yêu cầu của bạn:"
          : "Xin lỗi, mình chưa tìm thấy thông tin phù hợp cho yêu cầu này.",
        toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined,
        products,
      };
    }
  }

  // Vượt quá MAX_TOOL_ROUNDS hoặc chạy Round 2 cho Policy
  const isPolicy = toolsUsed.includes("get_policy");

  const finalContextMessages = [...contextMessages];
  if (isPolicy) {
    // Override System Prompt để ép AI không được tóm tắt như nhân viên bán hàng
    finalContextMessages[0] = {
      role: "system",
      content: `Bạn là trợ lý ảo cung cấp chính sách của Chợ Công Nghệ.
Khi khách hàng hỏi về chính sách, bạn phải tuân thủ:
1. Nếu khách hỏi CHUNG CHUNG: Hãy tóm tắt ngắn gọn, thân thiện và dễ hiểu các quyền lợi chính.
2. Nếu khách hỏi CỤ THỂ (ví dụ: rơi vỡ có bảo hành không): Trích xuất đúng ý trả lời ngắn gọn, đi thẳng vào vấn đề.`,
    };
  }

  try {
    const finalResponse = await executeWithGroqRotation(async (client) => {
      const res = await client.chat.completions.create({
        model: "gemini-2.5-flash",
        messages: [
          ...finalContextMessages,
          {
            role: "user",
            content: isPolicy 
              ? `Dựa vào tài liệu, hãy trả lời khách hàng ngắn gọn, tự nhiên, thân thiện.`
              : `Hãy trả lời khách hàng ngắn gọn, tự nhiên, thân thiện.`,
          },
        ],
        temperature: isPolicy ? 0.2 : 0.7,
        max_tokens: 1500,
      });

      if (!res.choices[0]?.message?.content) {
        throw new Error("Gemini returned an empty response in Round 2. Retrying...");
      }
      return res;
    });

    let finalReply = finalResponse.choices[0].message.content ||
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

    // Lưu vào Question Bank nếu đây là câu hỏi chính sách độc lập
    if (isStandalone && lastMessage && toolsUsed.includes("get_policy") && !toolsUsed.includes("search_products")) {
      if (policyCache.size >= MAX_CACHE_SIZE) {
        policyCache.clear(); // Evict all if full
      }
      policyCache.set(lastMessage, result);
      console.log("[Chatbot] Saved to FAQ Cache:", lastMessage);
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
