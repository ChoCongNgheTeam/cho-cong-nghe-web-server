import { env } from "@/config/env";

const geminiKeys = (process.env.GEMINI_API_KEY || process.env.GROQ_API_KEYS || process.env.OPENAI_API_KEY || "")
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);

let currentClientIndex = Math.floor(Math.random() * Math.max(1, geminiKeys.length));

/**
 * Thực thi hành động với Native Gemini API.
 * Nếu bị lỗi 429 hoặc 503, tự động xoay vòng sang key tiếp theo để thử lại.
 */
export const executeWithGeminiRotation = async <T>(
  action: (key: string) => Promise<T>
): Promise<T> => {
  if (geminiKeys.length === 0) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  let attempts = Math.max(3, geminiKeys.length);
  let lastError: any;

  while (attempts > 0) {
    const key = geminiKeys[currentClientIndex];

    try {
      return await action(key);
    } catch (error: any) {
      console.warn(`[Gemini Rotation] Lỗi API với key hiện tại: ${error.message || error.status}. Đang thử key khác...`);
      lastError = error;
      attempts--;
      currentClientIndex = (currentClientIndex + 1) % geminiKeys.length;
      if (attempts > 0) {
        await new Promise((res) => setTimeout(res, 1000));
      }
    }
  }

  throw lastError;
};
