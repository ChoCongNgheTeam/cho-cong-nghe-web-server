import express from "express";
import cors from "cors";
import routes from "./routes/v1";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "@/config/swagger";
import { cleanupRefreshTokens } from "./modules/auth/auth.service";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
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

export default app;
