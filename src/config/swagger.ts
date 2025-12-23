import swaggerJSDoc from "swagger-jsdoc";
import "dotenv/config";

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "API documentation cho dự án ChoCongNghe",
    },
    servers: [
      {
        url: `${process.env.API_BASE_URL}/api/v1`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            errors: {
              type: "object",
              additionalProperties: { type: "string" },
            },
          },
        },
      },
    },
  },
  apis: ["./src/app/modules/**/*.swagger.yaml", "./src/app/modules/**/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
