import express from "express";
import cors from "cors";
import routes from "./routes/v1";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "@/config/swagger";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1", routes);

export default app;
