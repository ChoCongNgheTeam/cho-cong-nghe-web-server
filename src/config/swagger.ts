import swaggerJSDoc from "swagger-jsdoc";

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
        url: "http://localhost:5000/api/v1", // thay port nếu khác
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
