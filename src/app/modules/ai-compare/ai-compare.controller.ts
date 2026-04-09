// ============================================================
// aiCompare.controller.ts
// Express controller — khớp pattern product.controller.ts:
//   - Không try/catch (asyncHandler + global error handler xử lý)
//   - Validate đã chạy ở middleware trước khi vào handler
//   - Chỉ extract params + gọi service + res.json()
// ============================================================

import { Request, Response } from "express";
import { compareProductsWithAI } from "./ai-compare.service";
import { AICompareBody } from "./ai-compare.validation";

/**
 * POST /api/ai/compare
 *
 * Body đã được validate bởi validate(aiCompareBodySchema, "body") middleware.
 */
export const aiCompareHandler = async (
  req: Request<{}, {}, AICompareBody>,
  res: Response
): Promise<void> => {
  const { productIds } = req.body;

  const result = await compareProductsWithAI(productIds);

  res.json({
    data: result,
    message: "So sánh sản phẩm thành công",
  });
};