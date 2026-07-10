import { Request, Response } from "express";
import { getCategoryFilters } from "./product_filter.service";
import { CategoryFiltersQuery } from "./product_filter.validation";

export const getCategoryFiltersHandler = async (req: Request, res: Response) => {
  const { category } = req.query as unknown as CategoryFiltersQuery;

  const filters = await getCategoryFilters(category);

  res.json({
    data: filters,
    message: "Lấy bộ lọc thành công",
  });
};
