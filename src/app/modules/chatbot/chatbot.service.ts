import OpenAI from "openai";
import { env } from "@/config/env";
import { ChatMessage, ChatResponse } from "./chatbot.types";
import { CHATBOT_SYSTEM_PROMPT } from "./prompts/system.prompt";
import { CHATBOT_TOOLS } from "./tools/tool.definitions";
import { executeSearchProducts, executeGetProductDetail, executeGetActivePromotions, executeGetPolicy } from "./tools/tool.executor";

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

const MAX_TOOL_ROUNDS = 3; // Tránh vòng lặp vô hạn

// ─── Dispatcher: routes tool name → executor ────────────────
const dispatchTool = async (name: string, args: Record<string, any>): Promise<string> => {
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
      return JSON.stringify({ message: "Không tìm thấy kết quả phù hợp" });
    }

    return JSON.stringify(result);
  } catch (err) {
    console.error(`[chatbot] Tool "${name}" error:`, err);
    return JSON.stringify({ error: "Lỗi khi tra cứu dữ liệu, vui lòng thử lại" });
  }
};

// ─── Main: getChatReply ──────────────────────────────────────
export const getChatReply = async (userMessages: ChatMessage[]): Promise<ChatResponse> => {
  // Build message list: system + last 10 turns (tránh tốn token)
  const contextMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: CHATBOT_SYSTEM_PROMPT },
    ...userMessages.slice(-10).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  const toolsUsed: string[] = [];
  let rounds = 0;

  // Tool-calling loop
  while (rounds < MAX_TOOL_ROUNDS) {
    rounds++;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // nhanh + rẻ, đủ dùng cho chatbot
      messages: contextMessages,
      tools: CHATBOT_TOOLS,
      tool_choice: "auto",
      temperature: 0.7,
      max_tokens: 1000,
    });

    const message = response.choices[0].message;

    // Không có tool call → AI đã trả lời xong
    if (!message.tool_calls || message.tool_calls.length === 0) {
      return {
        reply: message.content || "Xin lỗi, mình không hiểu câu hỏi. Bạn có thể nói rõ hơn không?",
        toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined,
      };
    }

    // AI muốn gọi tool(s)
    // Thêm assistant message vào context
    contextMessages.push(message);

    // Thực thi tất cả tool calls song song
    const toolResults = await Promise.all(
      message.tool_calls.map(async (toolCall) => {
        if (!("function" in toolCall)) {
          return {
            role: "tool" as const,
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: "Tool call không hợp lệ" }),
          };
        }

        const args = JSON.parse(toolCall.function.arguments || "{}");
        const result = await dispatchTool(toolCall.function.name, args);

        toolsUsed.push(toolCall.function.name);

        return {
          role: "tool" as const,
          tool_call_id: toolCall.id,
          content: result,
        };
      }),
    );

    // Thêm kết quả tool vào context
    contextMessages.push(...toolResults);

    // Loop lại → AI đọc kết quả và quyết định có cần gọi thêm tool không
  }

  // Vượt quá MAX_TOOL_ROUNDS → force reply
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

  return {
    reply: finalResponse.choices[0].message.content || "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.",
    toolsUsed,
  };
};

export const chatbotService = { getChatReply };
