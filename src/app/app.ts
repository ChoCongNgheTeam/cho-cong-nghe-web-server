import express from "express";
import cors from "cors";
import routes from "./routes/v1";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "@/config/swagger";
import { cleanupRefreshTokens } from "./modules/auth/auth.service";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

app.use(
  cors({
    // origin: process.env.FRONTEND_URL || ["http://localhost:3000", "http://127.0.0.1:5500",],
    origin: true,
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

app.use(express.json());

app.use(cookieParser());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1", routes);

app.use(errorMiddleware);

export default app;
