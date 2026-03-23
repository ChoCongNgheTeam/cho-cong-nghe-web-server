import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

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

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Bạn là AI kiểm duyệt nội dung, chỉ trả về JSON hợp lệ.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    });

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
