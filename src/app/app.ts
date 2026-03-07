import express from "express";
import cors from "cors";
import routes from "./routes/v1";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "@/config/swagger";
import { cleanupRefreshTokens } from "./modules/auth/auth.service";
import { errorMiddleware } from "./middlewares/error.middleware";
import { stripeWebhookHandler } from "./modules/payment/payment.controller";
import { asyncHandler } from "@/utils/async-handler";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

if (process.env.NODE_ENV === "production") {
  import("node-cron").then(({ default: cron }) => {
    cron.schedule("0 3 * * *", async () => {
      await cleanupRefreshTokens();
    });
  });
}

app.post("/api/v1/payments/webhook/stripe", express.raw({ type: "application/json" }), asyncHandler(stripeWebhookHandler));

app.use(express.json());

app.use(cookieParser());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.json({
    message: "Xin chào 👋",
    service: "ChoCongNghe API",
    docs: "https://api.chocongnghe.id.vn/api-docs",
  });
});
app.use("/api/v1", routes);

app.use(errorMiddleware);

export default app;
