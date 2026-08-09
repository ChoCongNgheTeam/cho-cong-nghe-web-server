import { Request, Response } from "express";
import { trendForecastService } from "./trend-forecast.service";

export const getForecastsHandler = async (req: Request, res: Response) => {
  try {
    const forecasts = await trendForecastService.getLatestForecasts();
    res.json({
      data: forecasts,
      message: "Lấy dự báo xu hướng thành công",
    });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi khi lấy dự báo", error: error.message });
  }
};

export const generateForecastHandler = async (req: Request, res: Response) => {
  try {
    const days = req.body.days || 7;
    const forecasts = await trendForecastService.generateForecast(days);
    res.json({
      data: forecasts,
      message: "Tạo dự báo xu hướng thành công",
    });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi khi tạo dự báo", error: error.message });
  }
};
