import OpenAI from "openai";
import { env } from "@/config/env";

const groqKeys = (process.env.GROQ_API_KEYS || process.env.OPENAI_API_KEY || "")
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);

// Disable automatic retries in the SDK so we can handle them manually across different keys
const openaiClients = groqKeys.map(
  (key) =>
    new OpenAI({
      apiKey: key,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      maxRetries: 0, 
    })
);

let currentClientIndex = 0;

/**
 * Thự thi hành động với Groq API.
 * Nếu bị lỗi (VD: 429 Too Many Requests), sẽ tự động xoay vòng sang key tiếp theo để thử lại.
 */
export const executeWithGroqRotation = async <T>(
  action: (client: OpenAI) => Promise<T>
): Promise<T> => {
  if (openaiClients.length === 0) {
    // Dự phòng khi không có key nào
    return action(new OpenAI({ apiKey: "dummy" }));
  }

  let attempts = openaiClients.length;
  let lastError: any;

  while (attempts > 0) {
    const client = openaiClients[currentClientIndex];
    // Chuyển sang key tiếp theo cho lần gọi sau hoặc nếu lần này lỗi
    currentClientIndex = (currentClientIndex + 1) % openaiClients.length;

    try {
      return await action(client);
    } catch (error: any) {
      console.warn(`[Groq Rotation] Lỗi API với key hiện tại: ${error.message}. Đang thử key khác...`);
      lastError = error;
      attempts--;
      if (attempts > 0) {
        // Nghỉ 1 chút trước khi thử lại
        await new Promise((res) => setTimeout(res, 500));
      }
    }
  }

  // Nếu tất cả các key đều lỗi, ném lỗi cuối cùng ra ngoài
  throw lastError;
};
