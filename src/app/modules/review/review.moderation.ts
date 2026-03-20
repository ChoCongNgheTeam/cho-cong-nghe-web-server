import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface ModerationResult {
  approved: boolean;
  reason?: string;
}

export const moderateReview = async (content: string): Promise<ModerationResult> => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `Bạn là hệ thống kiểm duyệt REVIEW sản phẩm.

Hãy đánh giá nội dung sau:

"${content}"

Tiêu chí từ chối:
- Chửi thề, tục tĩu
- Nội dung thù ghét, công kích cá nhân
- Spam, quảng cáo
- Nội dung 18+
- Nội dung không liên quan đến sản phẩm

Yêu cầu:
- Nếu OK → approved = true
- Nếu vi phạm → approved = false + reason (ngắn gọn, tiếng Việt)

Trả về JSON đúng format, KHÔNG markdown:

{"approved": true}

hoặc

{"approved": false, "reason": "lý do ngắn gọn"}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const parsed = JSON.parse(text);
    return parsed as ModerationResult;
  } catch (err) {
    console.error("Moderation AI error:", err);

    // fallback (fail-safe)
    return {
      approved: false,
      reason: "Không thể kiểm duyệt nội dung",
    };
  }
};
