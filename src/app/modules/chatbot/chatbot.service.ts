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

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY || process.env.OPENAI_API_KEY,
});

const MAX_TOOL_ROUNDS = 3;

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
      return JSON.stringify({ found: false, message: "Không tìm thấy kết quả phù hợp" });
    }

    return JSON.stringify({ found: true, data: result });
  } catch (err) {
    console.error(`[chatbot] Tool "${name}" error:`, err);
    return JSON.stringify({ found: false, error: "Lỗi khi tra cứu dữ liệu, vui lòng thử lại" });
  }
};

// ─── Main: getChatReply ──────────────────────────────────────
export const getChatReply = async (
  userMessages: ChatMessage[],
): Promise<ChatResponse> => {
  // Lấy 20 messages gần nhất (10 turn = 10 user + 10 assistant)
  const recentMessages = userMessages.slice(-20);

  // contextMessages là array LOCAL cho mỗi request — không share state giữa các request
  const contextMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
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
  let rounds = 0;

  while (rounds < MAX_TOOL_ROUNDS) {
    rounds++;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: contextMessages,
      tools: CHATBOT_TOOLS,
      tool_choice: "auto",
      temperature: 0.7,
      max_tokens: 1000,
    });

    const message = response.choices[0].message;

    // Không có tool call → AI đã có đủ thông tin để trả lời
    if (!message.tool_calls || message.tool_calls.length === 0) {
      const products = productCardMap.size > 0
        ? [...productCardMap.values()]
        : undefined;

      return {
        reply: message.content || "Xin lỗi, mình không hiểu câu hỏi. Bạn có thể nói rõ hơn không?",
        toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined,
        products,
      };
    }

    // Push assistant message (có tool_calls) vào context của round này
    contextMessages.push(message);

    const toolResults = await Promise.all(
      message.tool_calls.map(async (toolCall) => {
        if (!("function" in toolCall)) {
          return {
            role: "tool" as const,
            tool_call_id: toolCall.id,
            content: JSON.stringify({ found: false, error: "Tool call không hợp lệ" }),
          };
        }

        let args: Record<string, any> = {};
        try {
          args = JSON.parse(toolCall.function.arguments || "{}");
        } catch {
          return {
            role: "tool" as const,
            tool_call_id: toolCall.id,
            content: JSON.stringify({ found: false, error: "Arguments không hợp lệ" }),
          };
        }

        const result = await dispatchTool(toolCall.function.name, args);
        toolsUsed.push(toolCall.function.name);

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

    contextMessages.push(...toolResults);
  }

  // Vượt quá MAX_TOOL_ROUNDS → force reply với data đã có
  const finalResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      ...contextMessages,
      {
        role: "user",
        content: "Hãy tổng hợp và trả lời dựa trên thông tin đã có.",
      },
    ],
    temperature: 0.7,
    max_tokens: 800,
  });

  const products = productCardMap.size > 0
    ? [...productCardMap.values()]
    : undefined;

  return {
    reply:
      finalResponse.choices[0].message.content ||
      "Xin lỗi bạn, hiện tại mình chưa tìm thấy thông tin phù hợp cho yêu cầu này. Bạn có thể liên hệ Hotline 1800.6060 (Nhánh 1) để được hỗ trợ nhanh nhất nhé!",
    toolsUsed,
    products,
  };
};

export const chatbotService = { getChatReply };