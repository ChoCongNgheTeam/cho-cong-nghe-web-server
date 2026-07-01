import OpenAI from "openai";

import { executeWithGroqRotation } from "@/utils/groq.util";

export interface ModerationResult {
  approved: boolean;
  reason?: string;
}

type ContentType = "review" | "comment";

const buildPrompt = (type: ContentType, content: string) => {
  if (type === "review") {
    return `Bạn là hệ thống kiểm duyệt REVIEW sản phẩm.

Hãy đánh giá nội dung sau:

"${content}"

Tiêu chí từ chối:
- Chửi thề, tục tĩu
- Nội dung thù ghét, công kích cá nhân
- Spam, quảng cáo
- Nội dung 18+
- Nội dung không liên quan đến sản phẩm

Yêu cầu:
- Nếu OK → {"approved": true}
- Nếu vi phạm → {"approved": false, "reason": "lý do ngắn gọn"}

Chỉ trả về JSON hợp lệ, KHÔNG markdown.`;
  }

  // comment
  return `Bạn là hệ thống kiểm duyệt BÌNH LUẬN.

Hãy kiểm tra nội dung sau:

"${content}"

Tiêu chí từ chối:
- Văn tục, chửi thề
- Spam
- Nội dung thù ghét, quấy rối
- Nội dung 18+

Yêu cầu:
- Nếu hợp lệ → {"approved": true}
- Nếu vi phạm → {"approved": false, "reason": "lý do ngắn gọn"}

Chỉ trả về JSON hợp lệ, KHÔNG markdown.`;
};

export const moderateContent = async (type: ContentType, content: string): Promise<ModerationResult> => {
  // ⚡ fallback nhanh (tiết kiệm tiền API)
  if (!content || content.trim().length < 2) {
    return { approved: false, reason: "Nội dung không hợp lệ" };
  }

  try {
    const prompt = buildPrompt(type, content);

    const response = await executeWithGroqRotation(client => client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a content moderation assistant. Respond ONLY with a valid JSON object. No explanation, no markdown wrapping.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0,
    }));
    
    const text = response.choices[0].message.content?.trim() || "{}";
    const parsed = JSON.parse(text);

    return parsed as ModerationResult;
  } catch (err) {
    console.error("Moderation AI error:", err);

    return {
      approved: false,
      reason: "Không thể kiểm duyệt nội dung",
    };
  }
};
