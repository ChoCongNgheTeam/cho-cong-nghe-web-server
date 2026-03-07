import { Request, Response } from "express";

export const redirectToFrontend = (res: Response, orderId: string): void => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  res.redirect(`${frontendUrl}/payment/result?orderId=${orderId}`);
};
