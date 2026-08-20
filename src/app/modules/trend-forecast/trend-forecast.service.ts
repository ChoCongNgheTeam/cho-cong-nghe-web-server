import prisma from "../../../config/db";
import { Prisma } from "@prisma/client";
import { executeWithFireworks } from "../../../utils/fireworks.util";

class TrendForecastService {
  /**
   * Validate/clamp the "days" window used in raw SQL date-range filters.
   * Defence in depth: even though callers should already validate via the
   * route-level zod schema, we never trust a number this deep into raw SQL
   * without re-checking it's a safe finite positive integer within bounds.
   */
  private static sanitizeDays(days: number): number {
    const n = Number(days);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) {
      return 7;
    }
    return Math.min(n, 365);
  }

  /**
   * Log search query to database (raw SQL to bypass Prisma client limitations during testing)
   */
  async logSearchQuery(query: string, userId: string | undefined, resultCount: number) {
    try {
      if (!query || query.trim().length === 0) return;
      
      const q = query.trim().toLowerCase();
      
      // Use raw SQL because search_query_logs might not be generated in Prisma client yet
      await prisma.$executeRaw`
        INSERT INTO "search_query_logs" ("query", "userId", "resultCount", "createdAt")
        VALUES (${q}, ${userId || null}, ${resultCount}, NOW())
      `;
      
    } catch (error) {
      console.error("[TrendForecastService] Error logging search query:", error);
    }
  }

  /**
   * Get search trends for the last N days
   */
  async getSearchTrends(days: number = 7) {
    const safeDays = TrendForecastService.sanitizeDays(days);
    // Parameterized raw SQL (days is validated to be a safe positive integer,
    // and passed as a bound parameter rather than string-interpolated).
    const result = await prisma.$queryRaw<any[]>`
      SELECT 
        "query", 
        COUNT(*) as "searchCount", 
        MIN("resultCount") as "minResultCount"
      FROM "search_query_logs"
      WHERE "createdAt" >= NOW() - (${safeDays} || ' days')::interval
      GROUP BY "query"
      ORDER BY "searchCount" DESC
      LIMIT 20
    `;
    
    // Format BigInt from Prisma raw query to Number
    return result.map(row => ({
      query: row.query,
      searchCount: Number(row.searchCount),
      minResultCount: Number(row.minResultCount)
    }));
  }

  /**
   * Get enriched search trends (including product matches and sales)
   */
  async getEnrichedSearchTrends(days: number = 7) {
    const safeDays = TrendForecastService.sanitizeDays(days);
    const searchTrends = await this.getSearchTrends(safeDays);
    
    const enrichedData = [];
    for (const item of searchTrends) {
      // Find products matching keyword and their sales in the period
      // (safeDays is a validated positive integer, bound as a parameter below)
      const matchedProducts = await prisma.$queryRaw<any[]>`
        SELECT 
          p."id" as "productId",
          p."name" as "productName",
          COALESCE(SUM(oi."quantity"), 0) as "totalSoldInPeriod"
        FROM "products" p
        LEFT JOIN "products_variants" pv ON pv."productId" = p."id"
        LEFT JOIN "order_items" oi ON oi."productVariantId" = pv."id"
        LEFT JOIN "orders" o ON oi."orderId" = o."id" 
             AND o."orderStatus" != 'CANCELLED' 
             AND o."orderDate" >= NOW() - (${safeDays} || ' days')::interval
        WHERE p."name" ILIKE ${`%${item.query}%`}
        GROUP BY p."id", p."name"
        ORDER BY "totalSoldInPeriod" DESC
        LIMIT 3
      `;

      enrichedData.push({
        keyword: item.query,
        searchCount: item.searchCount,
        minResultCount: item.minResultCount,
        matchedProductsInStore: matchedProducts.map(p => ({
          productName: p.productName,
          totalSoldInPeriod: Number(p.totalSoldInPeriod)
        }))
      });
    }

    return enrichedData;
  }

  /**
   * Generate forecast using AI (Single Pass)
   */
  async generateForecast(days: number = 7) {
    const safeDays = TrendForecastService.sanitizeDays(days);
    days = safeDays;
    const enrichedSearchTrends = await this.getEnrichedSearchTrends(days);

    if (enrichedSearchTrends.length === 0) {
      return { message: "Không có dữ liệu trong thời gian này để dự báo." };
    }

    const currentTime = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

    const systemPrompt = `Bạn là chuyên gia phân tích dữ liệu bán lẻ và dự báo nhu cầu (Trend Forecast).
Nhiệm vụ của bạn là phân tích dữ liệu mua hàng và tìm kiếm thực tế của khách hàng trong ${days} ngày qua để phát hiện xu hướng đang lên hoặc nhu cầu bị bỏ lỡ.

THÔNG TIN THỜI GIAN THỰC:
- Thời gian hiện tại lúc lập báo cáo: ${currentTime}
- Khoảng thời gian phân tích: ${days} ngày qua.
(Hãy dùng bối cảnh thời gian này để đưa ra lời khuyên nhập hàng cho phù hợp với mùa vụ nếu cần).

ĐỊNH DẠNG ĐẦU RA BẮT BUỘC: 
Trả về MỘT mảng JSON hợp lệ chứa các đối tượng dự báo (tối đa 5 dự báo quan trọng nhất). Không kèm giải thích ngoài JSON.
Mỗi đối tượng phải có cấu trúc:
{
  "keyword": "từ khóa liên quan",
  "forecastScore": số từ 0-100 đánh giá độ Hot,
  "suggestedAction": "Hành động đề xuất ngắn gọn (VD: Nhập thêm hàng, Chạy Flash Sale)",
  "reasoning": "Giải thích chi tiết tại sao đưa ra đề xuất này dựa vào dữ liệu (có nhắc đến thời điểm hiện tại nếu liên quan)"
}`;

    const userPrompt = `DỮ LIỆU TÌM KIẾM ĐÃ ĐƯỢC HỆ THỐNG TRA CỨU:
${JSON.stringify(enrichedSearchTrends, null, 2)}

Hướng dẫn phân tích:
- "searchCount": Số lượng lượt tìm kiếm từ khóa này.
- "minResultCount": Số lượng kết quả hiển thị cho khách. Nếu = 0 nghĩa là khách tìm nhưng không thấy sản phẩm nào!
- "matchedProductsInStore": Thông tin các sản phẩm trong kho có tên giống từ khóa, kèm theo số lượng bán ra ("totalSoldInPeriod") trong ${days} ngày qua. Nếu mảng này rỗng, nghĩa là shop hoàn toàn chưa kinh doanh sản phẩm này.

Dựa trên dữ liệu trên, hãy phân tích và trả về mảng JSON dự báo.`;

    try {
      const aiResponseText = await executeWithFireworks(async (client) => {
        const response = await client.chat.completions.create({
          model: "accounts/fireworks/routers/glm-5p2-fast",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          max_tokens: 4000,
          temperature: 0.3
        });
        return response.choices[0].message.content || "";
      });
      
      // Lọc JSON từ Markdown nếu có
      let jsonString = aiResponseText;
      const jsonMatch = aiResponseText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1];
      }

      const forecasts = JSON.parse(jsonString);

      // Xóa dự báo cũ và lưu dự báo mới trong 1 transaction để tránh mất dữ liệu
      // nếu có lỗi giữa chừng (VD: 1 phần tử forecast bị AI trả sai định dạng).
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.$executeRaw`DELETE FROM "demand_forecasts"`;

        for (const forecast of forecasts) {
          await tx.$executeRaw`
            INSERT INTO "demand_forecasts" ("keyword", "period", "forecastScore", "suggestedAction", "reasoning", "generatedAt")
            VALUES (${forecast.keyword || ""}, ${`LAST_${days}_DAYS`}, ${forecast.forecastScore || 0}, ${forecast.suggestedAction || ""}, ${forecast.reasoning || ""}, NOW())
          `;
        }
      });

      return forecasts;
    } catch (error) {
      console.error("[TrendForecastService] Lỗi khi gọi AI dự báo:", error);
      throw error;
    }
  }

  /**
   * Get latest forecasts
   */
  async getLatestForecasts() {
    const result = await prisma.$queryRaw<any[]>`
      SELECT * FROM "demand_forecasts"
      ORDER BY "forecastScore" DESC
    `;
    return result;
  }
}

export const trendForecastService = new TrendForecastService();
