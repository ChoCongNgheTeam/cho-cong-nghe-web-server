import OpenAI from "openai";

const fireworksKeys = (process.env.FIREWORKS_API_KEY || "")
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);

// Khởi tạo các client OpenAI cho Fireworks
const fireworksClients = fireworksKeys.map(
  (key) =>
    new OpenAI({
      apiKey: key,
      baseURL: "https://api.fireworks.ai/inference/v1",
      maxRetries: 0, 
    })
);

let currentClientIndex = 0;

/**
 * Thực thi hành động với Fireworks API.
 * Nếu bị lỗi (VD: 429 Too Many Requests), sẽ tự động xoay vòng sang key tiếp theo để thử lại.
 */
export const executeWithFireworks = async <T>(
  action: (client: OpenAI) => Promise<T>
): Promise<T> => {
  if (fireworksClients.length === 0) {
    throw new Error("Missing FIREWORKS_API_KEY in environment variables");
  }

  let attempts = fireworksClients.length;
  let lastError: any;

  while (attempts > 0) {
    const client = fireworksClients[currentClientIndex];
    // Chuyển sang key tiếp theo cho lần gọi sau hoặc nếu lần này lỗi
    currentClientIndex = (currentClientIndex + 1) % fireworksClients.length;

    try {
      return await action(client);
    } catch (error: any) {
      console.warn(`[Fireworks Rotation] Lỗi API với key hiện tại: ${error.message}. Đang thử key khác...`);
      lastError = error;
      attempts--;
      if (attempts > 0) {
        // Nghỉ 1 chút trước khi thử lại
        await new Promise((res) => setTimeout(res, 1000));
      }
    }
  }

  // Nếu tất cả các key đều lỗi, ném lỗi cuối cùng ra ngoài
  throw lastError;
};
