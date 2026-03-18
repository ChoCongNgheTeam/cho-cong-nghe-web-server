// Không có visa
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ModerationResult {
  approved: boolean;
  reason?: string;
}

// /**
//  * Dùng OpenAI Moderation API để kiểm tra nội dung comment.
//  * Nếu API fail → throw error để caller xử lý fallback.
//  */
export const moderateComment = async (content: string): Promise<ModerationResult> => {
  const response = await openai.moderations.create({
    model: "omni-moderation-latest",
    input: content,
  });

  const result = response.results[0];

  if (result.flagged) {
    // Lấy các category bị flag để log / lưu reason
    const flaggedCategories = Object.entries(result.categories)
      .filter(([, flagged]) => flagged)
      .map(([category]) => category);

    return {
      approved: false,
      reason: `Nội dung vi phạm: ${flaggedCategories.join(", ")}`,
    };
  }

  return { approved: true };
};

// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// interface ModerationResult {
//   approved: boolean;
//   reason?: string;
// }

// export const moderateComment = async (content: string): Promise<ModerationResult> => {
//   const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

//   const prompt = `Bạn là hệ thống kiểm duyệt bình luận. Hãy kiểm tra nội dung sau và trả về JSON.

// Nội dung: "${content}"

// Tiêu chí từ chối: văn tục, chửi thề, spam, nội dung thù ghét, quấy rối, nội dung 18+.

// Trả về JSON theo đúng format này, KHÔNG kèm markdown:
// {"approved": true}
// hoặc
// {"approved": false, "reason": "lý do ngắn gọn"}`;

//   const result = await model.generateContent(prompt);
//   const text = result.response.text().trim();

//   const parsed = JSON.parse(text);
//   return parsed as ModerationResult;
// };

// interface ModerationResult {
//   approved: boolean;
//   reason?: string;
// }

// const BAD_WORDS = [
//   // Chửi thề tiếng Việt
//   "đụ",
//   "đù",
//   "địt",
//   "đéo",
//   "đ éo",
//   "đ.éo",
//   "lồn",
//   "cặc",
//   "buồi",
//   "vãi",
//   "chó",
//   "chó chết",
//   "mẹ mày",
//   "mẹ m",
//   "má mày",
//   "cái lon",
//   "cái lồn",
//   "thằng chó",
//   "con chó",
//   "đồ chó",
//   "ngu",
//   "óc chó",
//   "đần",
//   "khùng",
//   "điên",
//   "thần kinh",
//   "vô học",
//   "mất dạy",
//   "vô dạy",
//   "súc vật",
//   "đỉ",
//   "điếm",
//   "cave",
//   "gái gọi",
//   "thằng điên",
//   "con điên",
//   "tiên sư",
//   "tiên sư mày",
//   "đồ ngu",
//   "thằng ngu",
//   "con ngu",

//   // Bypass phổ biến (thêm dấu cách / ký tự)
//   "d.u",
//   "d u m",
//   "l.o.n",
//   "c.a.c",
//   "b.u.o.i",

//   // Tiếng Anh
//   "fuck",
//   "f*ck",
//   "f**k",
//   "shit",
//   "bitch",
//   "asshole",
//   "bastard",
//   "dick",
//   "pussy",
//   "cunt",
//   "nigger",
//   "faggot",
//   "retard",
// ];

// /**
//  * Normalize: lowercase, bỏ dấu, bỏ ký tự đặc biệt thừa
//  * để bắt các kiểu bypass như: "đ.ụ", "Đ Ụ", "d_u_m"
//  */
// const normalize = (text: string): string => {
//   return text
//     .toLowerCase()
//     .normalize("NFD")
//     .replace(/[\u0300-\u036f]/g, "") // bỏ dấu tiếng Việt
//     .replace(/[^a-z0-9\s]/g, " ") // thay ký tự đặc biệt bằng space
//     .replace(/\s+/g, " ") // collapse nhiều space
//     .trim();
// };

// export const moderateComment = async (content: string): Promise<ModerationResult> => {
//   const normalized = normalize(content);

//   const found = BAD_WORDS.find((word) => {
//     const normalizedWord = normalize(word);
//     return normalized.includes(normalizedWord);
//   });

//   if (found) {
//     return {
//       approved: false,
//       reason: `Nội dung chứa từ ngữ không phù hợp`,
//     };
//   }

//   return { approved: true };
// };
