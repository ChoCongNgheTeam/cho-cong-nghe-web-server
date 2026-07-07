import { ChatMessage } from "../chatbot.types";
import { env } from "@/config/env";
import axios from "axios";

const FIREWORKS_MODEL = "accounts/fireworks/models/gpt-oss-120b";
const FIREWORKS_API_URL = "https://api.fireworks.ai/inference/v1/chat/completions";

/**
 * Viết lại câu hỏi của người dùng (Query Rewriting) dựa trên lịch sử hội thoại.
 * Mục đích: Biến các câu hỏi phụ thuộc ngữ cảnh (VD: "Tại sao?", "Còn con kia thì sao?") 
 * thành câu hỏi độc lập (Standalone) để truy xuất Cache/Vector chính xác hơn.
 */
export async function rewriteQueryWithContext(history: ChatMessage[], latestQuery: string): Promise<string> {
  const token = process.env.FIREWORKS_API_KEY;
  if (!token) {
    console.warn("[Rewriter] Thiếu FIREWORKS_API_KEY, trả về nguyên bản câu hỏi.");
    return latestQuery;
  }

  // Nếu không có lịch sử, không cần rewrite
  if (!history || history.length === 0) {
    return latestQuery;
  }

  const systemPrompt = `Bạn là một trợ lý ngôn ngữ thông minh.
Nhiệm vụ: Đọc LỊCH SỬ TRÒ CHUYỆN và CÂU HỎI MỚI NHẤT của người dùng.
- Nếu câu hỏi mới nhất phụ thuộc vào lịch sử (ví dụ: dùng đại từ "nó", "thằng kia", "tại sao", "còn mẫu nào không", v.v.), hãy VIẾT LẠI câu hỏi đó thành một câu hoàn chỉnh, độc lập ngữ cảnh (có đủ chủ ngữ, vị ngữ, đối tượng cụ thể).
- Nếu câu hỏi mới nhất đã tự mang đầy đủ ý nghĩa, HOẶC người dùng chuyển sang một chủ đề hoàn toàn mới, hãy GIỮ NGUYÊN câu hỏi đó.
- KHÔNG giải thích, KHÔNG thêm bất kỳ bình luận nào. CHỈ trả về đúng 1 câu duy nhất là câu hỏi đã được viết lại.
- Trả lời bằng tiếng Việt.`;

  // Chỉ lấy tối đa 4 tin nhắn gần nhất để làm ngữ cảnh (tránh quá tải token)
  const recentHistory = history.slice(-4);
  const historyText = recentHistory.map(msg => {
    let text = `[${msg.role.toUpperCase()}]: ${msg.content}`;
    if (msg.role === 'assistant' && msg.products && Array.isArray(msg.products)) {
      const productNames = msg.products.map((p: any) => p.name).join(", ");
      text += ` (Đã đề xuất các sản phẩm: ${productNames})`;
    }
    return text;
  }).join("\n");
  const userPrompt = `LỊCH SỬ TRÒ CHUYỆN:\n${historyText}\n\nCÂU HỎI MỚI NHẤT: ${latestQuery}\n\nCÂU HỎI ĐỘC LẬP LÀ:`;

  try {
    const res = await axios.post(
      FIREWORKS_API_URL,
      {
        model: FIREWORKS_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1, // Cực thấp để không bịa chuyện
        max_tokens: 500,
      },
      {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        timeout: 8000 // Chờ tối đa 8 giây, con GLM-5.2 to quá nên thỉnh thoảng phản hồi chậm
      }
    );

    let rewritten = res.data.choices?.[0]?.message?.content?.trim();
    
    // Nếu AI trả về rỗng hoặc lỗi, fallback về câu gốc
    if (!rewritten) {
      return latestQuery;
    }

    // Đôi khi AI bọc câu trong dấu ngoặc kép, gỡ ra
    rewritten = rewritten.replace(/^["'](.*)["']$/, '$1');

    console.log(`[Rewriter] Original: "${latestQuery}" => Rewritten: "${rewritten}"`);
    return rewritten;

  } catch (error: any) {
    console.warn(`[Rewriter] Lỗi gọi Fireworks API (${error.message}). Trả về nguyên bản câu hỏi.`);
    return latestQuery;
  }
}
