import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface ModerationResult {
  approved: boolean;
  reason?: string;
}

export const moderateComment = async (content: string): Promise<ModerationResult> => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `Bạn là hệ thống kiểm duyệt bình luận. Hãy kiểm tra nội dung sau và trả về JSON.

Nội dung: "${content}"

Tiêu chí từ chối: văn tục, chửi thề, spam, nội dung thù ghét, quấy rối, nội dung 18+.

Trả về JSON theo đúng format này, KHÔNG kèm markdown:
{"approved": true}
hoặc
{"approved": false, "reason": "lý do ngắn gọn"}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  const parsed = JSON.parse(text);
  return parsed as ModerationResult;
};
