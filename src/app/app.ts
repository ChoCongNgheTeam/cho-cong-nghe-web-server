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
import { initFirebase } from "@/app/modules/integrations/firebase.service";
import { startJobs } from "@/app/modules/jobs/jobs.bootstrap";

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// if (process.env.NODE_ENV === "production") {
//   import("node-cron").then(({ default: cron }) => {
//     cron.schedule(
//       "0 3 * * *",
//       async () => {
//         console.log("🧹 Running cleanupRefreshTokens...");
//         await cleanupRefreshTokens();
//       },
//       {
//         timezone: "Asia/Ho_Chi_Minh",
//       },
//     );
//   });
// }

// if (process.env.NODE_ENV === "production") {
//   import("node-cron").then(({ default: cron }) => {
//     cron.schedule(
//       "* * * * *", // mỗi phút
//       async () => {
//         console.log("🔥 CRON RUNNING");
//         await cleanupRefreshTokens();
//       },
//       {
//         timezone: "Asia/Ho_Chi_Minh",
//       },
//     );
//   });
// }

app.post("/cron/cleanup-refresh-tokens", async (req, res) => {
  const auth = req.headers.authorization;

  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const result = await cleanupRefreshTokens();

  res.json({ deleted: result });
});

initFirebase();
startJobs();

app.post("/api/v1/payments/webhook/stripe", express.raw({ type: "application/json" }), asyncHandler(stripeWebhookHandler));

app.use(express.json());

app.use(cookieParser());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/test-cleanup", async (req, res) => {
  await cleanupRefreshTokens();
  res.send("Cleanup done");
});

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
