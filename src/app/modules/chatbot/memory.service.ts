import { PrismaClient } from "@prisma/client";
import { ChatMessage } from "./chatbot.types";
import { executeWithGeminiRotation } from "@/utils/gemini.util";
import { generateEmbedding } from "./sync/embedding.sync";
import { executeWithGroqRotation } from "@/utils/groq.util";

const prisma = new PrismaClient();

export const memoryService = {
  // 1. Lưu Session & Quản lý Sliding Window (Tầng 1)
  async saveSession(sessionId: string, userId: string | undefined, messages: ChatMessage[]) {
    // Chỉ giữ lại tối đa 40 câu chat gần nhất
    const slicedMessages = messages.slice(-40);
    
    // Upsert session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Giữ 7 ngày

    await prisma.chat_sessions.upsert({
      where: { sessionKey: sessionId },
      update: {
        userId: userId,
        messages: slicedMessages as any,
        updatedAt: new Date(),
        expiresAt
      },
      create: {
        sessionKey: sessionId,
        userId: userId,
        messages: slicedMessages as any,
        expiresAt
      }
    });
  },

  // 2. Load User Preferences (Tầng 2)
  async getUserProfileContext(userId: string | undefined): Promise<string> {
    if (!userId) return "";
    const prefs = await prisma.user_preferences.findMany({
      where: { userId }
    });
    if (prefs.length === 0) return "";
    
    const profileStrs = prefs.map(p => `- ${p.key}: ${p.value}`);
    return `\n\n[HỒ SƠ KHÁCH HÀNG (Do AI tự ghi nhớ)]:\n${profileStrs.join("\n")}\nLưu ý: Luôn ưu tiên tư vấn dựa trên hồ sơ này nếu phù hợp.`;
  },

  // 3. Load Ký ức cũ từ Vector DB (Tầng 3)
  async getVectorContext(sessionId: string, userId: string | undefined, latestMessage: string): Promise<string> {
    try {
      const embedding = await generateEmbedding(latestMessage, 'query');
      
      let queryCondition = ``;
      if (userId) {
        queryCondition = `("userId" = '${userId}' OR "sessionId" = '${sessionId}')`;
      } else {
        queryCondition = `"sessionId" = '${sessionId}'`;
      }

      const vectorQuery = `
        SELECT "content" FROM "chat_memory_vectors"
        WHERE ${queryCondition}
        ORDER BY "embedding" <-> '[${embedding.join(',')}]'::vector
        LIMIT 3
      `;
      
      const rows: { content: string }[] = await prisma.$queryRawUnsafe(vectorQuery);
      if (rows.length === 0) return "";

      const memories = rows.map((r, i) => `Ký ức ${i+1}: ${r.content}`).join("\n");
      return `\n\n[KÝ ỨC CŨ TỪ VECTOR DB]:\n${memories}\nLưu ý: Đây là những chuyện đã nói từ lâu, chỉ dùng khi cần thiết.`;
    } catch (err) {
      console.error("[memoryService] getVectorContext error:", err);
      return "";
    }
  },

  // 4. Background Job: Tóm tắt & Vector hóa (Chunking)
  async processBackgroundMemory(sessionId: string, userId: string | undefined, messages: ChatMessage[]) {
    // 4.1 Chunking Vector (Mỗi 6 messages)
    if (messages.length >= 6 && messages.length % 6 === 0) {
      const chunkMessages = messages.slice(-6);
      const transcript = chunkMessages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
      try {
        const embedding = await generateEmbedding(transcript, 'passage');
        await prisma.$executeRawUnsafe(`
          INSERT INTO "chat_memory_vectors" ("id", "sessionId", "userId", "content", "embedding", "createdAt")
          VALUES (gen_random_uuid(), '${sessionId}', ${userId ? `'${userId}'` : 'NULL'}, $1, '[${embedding.join(',')}]'::vector, NOW())
        `, transcript);
        console.log(`[memoryService] Tạo Vector thành công cho session: ${sessionId}`);
      } catch (err) {
        console.error("[memoryService] processBackgroundMemory chunking error:", err);
      }
    }

    // 4.2 Auto-Summarization (Giảm Token nếu quá dài)
    if (messages.length >= 30) { // Khi tới 30 câu
      const totalChars = messages.reduce((acc, m) => acc + (m.content?.length || 0), 0);
      if (totalChars > 4000) {
        try {
          console.log(`[memoryService] Context quá dài (${totalChars} chars). Bắt đầu tóm tắt ngầm...`);
          const oldestMessages = messages.slice(0, 20);
          const transcriptToSummarize = oldestMessages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
          
          const summaryPrompt = `Hãy tóm tắt ngắn gọn cuộc trò chuyện sau trong 1-2 câu. 
BẮT BUỘC giữ lại tên sản phẩm cụ thể, thông số chính, link sản phẩm (nếu có) và trạng thái chốt đơn của khách.
Cuộc trò chuyện:
${transcriptToSummarize}`;

          const summary = await executeWithGeminiRotation(async (key) => {
            const body = {
              contents: [{ role: "user", parts: [{ text: summaryPrompt }] }],
              generationConfig: { temperature: 0.2, maxOutputTokens: 150 },
            };

            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error(`Status ${res.status}`);
            const data = await res.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
          });

          const newMessages = [
            { role: "assistant" as const, content: `[HỆ THỐNG]: Tóm tắt cuộc trò chuyện trước: ${summary}` },
            ...messages.slice(20) // Giữ lại 10-20 câu mới nhất
          ];

          // Cập nhật lại DB
          await prisma.chat_sessions.update({
            where: { sessionKey: sessionId },
            data: { messages: newMessages as any }
          });
          console.log(`[memoryService] Auto-Summarization hoàn tất cho session: ${sessionId}`);
        } catch (err) {
          console.error("[memoryService] Auto-Summarization error:", err);
        }
      }
    }
  }
};
