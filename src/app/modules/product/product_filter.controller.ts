import { Request, Response } from "express";
import { getCategoryFilters } from "./product_filter.service";
import { categoryFiltersQuerySchema } from "./product_filter.validation";

export const getCategoryFiltersHandler = async (req: Request, res: Response) => {
  const { category } = categoryFiltersQuerySchema.parse(req.query);

  const filters = await getCategoryFilters(category);

  res.json({
    data: filters,
    message: "Lấy bộ lọc thành công",
  });
};
