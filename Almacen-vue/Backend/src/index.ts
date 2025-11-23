import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { usuariosRouter } from "./routes/usuarios";
import { articulosRouter } from "./routes/articulos";
import { ventasRouter } from "./routes/ventas";

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Almacén",
      version: "1.0.0",
      description:
        "API para gestión de almacén con usuarios, artículos y ventas",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Rutas
app.use("/api/usuarios", usuariosRouter);
app.use("/api/articulos", articulosRouter);
app.use("/api/ventas", ventasRouter);

// IMPORTANTE: Este listener debe estar al final
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📚 Documentación Swagger en http://localhost:${PORT}/api-docs`);
});
