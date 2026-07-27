import { executeWithGeminiRotation } from "@/utils/gemini.util";
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

    const text = await executeWithGeminiRotation(async (key) => {
      const body = {
        system_instruction: { parts: [{ text: "You are a content moderation assistant. Respond ONLY with a valid JSON object. No explanation, no markdown wrapping." }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0, responseMimeType: "application/json" },
      };

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`${res.status} status code: ${await res.text()}`);

      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";
    });
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
