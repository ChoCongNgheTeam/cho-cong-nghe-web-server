import { Request, Response } from "express";
import * as service from "./recommendation.service";
import { SimilarProductsQuery, ForYouQuery, TrackViewEventInput, TrackRecommendationClickInput, RecommendationAnalyticsQuery, RecentlyViewedQuery } from "./recommendation.validation";

export const getSimilarProductsHandler = async (req: Request, res: Response) => {
  const { limit = 8 } = req.query as unknown as SimilarProductsQuery;
  const result = await service.getSimilarProducts(req.params.productId, limit, req.user?.id);
  res.json({ data: result.products, message: "Lấy sản phẩm tương tự thành công" });
};

export const getBoughtTogetherProductsHandler = async (req: Request, res: Response) => {
  const { limit = 8 } = req.query as unknown as SimilarProductsQuery;
  const products = await service.getBoughtTogetherProducts(req.params.productId, limit, req.user?.id);
  res.json({ data: products, message: "Lấy sản phẩm hay mua cùng thành công" });
};

export const getForYouHandler = async (req: Request, res: Response) => {
  const { limit = 12, sessionId } = req.query as unknown as ForYouQuery;
  const result = await service.getForYou({ userId: req.user?.id, sessionId, limit });
  res.json({ data: result.products, message: "Lấy gợi ý sản phẩm thành công" });
};

export const trackViewEventHandler = async (req: Request, res: Response) => {
  const { productId, sessionId, source } = req.body as TrackViewEventInput;
  await service.trackViewEvent({ userId: req.user?.id, sessionId, productId, source });
  res.status(201).json({ message: "Đã ghi nhận lượt xem" });
};

export const getRecentlyViewedHandler = async (req: Request, res: Response) => {
  const { limit = 4, sessionId, excludeProductId } = req.query as unknown as RecentlyViewedQuery;
  const ids = await service.getRecentlyViewed({ userId: req.user?.id, sessionId, limit, excludeProductId });
  res.json({ data: ids.map((id) => ({ id })), message: "Lấy sản phẩm đã xem gần đây thành công" });
};

export const trackRecommendationClickHandler = async (req: Request, res: Response) => {
  const { productId, algorithm } = req.body as TrackRecommendationClickInput;
  await service.trackRecommendationClick(productId, algorithm, req.user?.id);
  res.json({ message: "Đã ghi nhận lượt click gợi ý" });
};

// ================== ADMIN ==================

export const getAnalyticsHandler = async (req: Request, res: Response) => {
  const { days = 30 } = req.query as unknown as RecommendationAnalyticsQuery;
  const data = await service.getAnalytics(days);
  res.json({ data, message: "Lấy thống kê hiệu suất gợi ý thành công" });
};
