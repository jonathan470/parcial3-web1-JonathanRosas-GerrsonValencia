import { Router, Request, Response } from "express";

const router = Router();

interface DetalleVenta {
  articuloId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface Venta {
  id: number;
  fecha: string;
  articulos: DetalleVenta[];
  total: number;
  metodoPago: string;
}

let ventas: Venta[] = [];

/**
 * @swagger
 * components:
 *   schemas:
 *     Venta:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         fecha:
 *           type: string
 *         total:
 *           type: number
 *         metodoPago:
 *           type: string
 */

/**
 * @swagger
 * /api/ventas:
 *   get:
 *     summary: Obtener todas las ventas
 *     tags: [Ventas]
 *     responses:
 *       200:
 *         description: Lista de ventas
 */
router.get("/", (req: Request, res: Response) => {
  res.json(ventas);
});

/**
 * @swagger
 * /api/ventas/{id}:
 *   get:
 *     summary: Obtener una venta por ID
 *     tags: [Ventas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Venta encontrada
 */
router.get("/:id", (req: Request, res: Response) => {
  const venta = ventas.find((v) => v.id === parseInt(req.params.id));
  if (venta) {
    res.json(venta);
  } else {
    res.status(404).json({ message: "Venta no encontrada" });
  }
});

/**
 * @swagger
 * /api/ventas:
 *   post:
 *     summary: Crear nueva venta
 *     tags: [Ventas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               articulos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     articuloId:
 *                       type: integer
 *                     cantidad:
 *                       type: integer
 *               metodoPago:
 *                 type: string
 *     responses:
 *       201:
 *         description: Venta creada
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { articulos: articulosVenta, metodoPago } = req.body;

    // Obtener artículos del endpoint
    const response = await fetch("http://localhost:3000/api/articulos");
    const articulosDB = await response.json();

    const detalles: DetalleVenta[] = [];
    let total = 0;

    // Validar y calcular cada artículo
    for (const item of articulosVenta) {
      const articulo = articulosDB.find((a: any) => a.id === item.articuloId);

      if (!articulo) {
        return res
          .status(400)
          .json({ message: `Artículo ${item.articuloId} no encontrado` });
      }

      if (articulo.stock < item.cantidad) {
        return res.status(400).json({
          message: `Stock insuficiente para ${articulo.nombre}. Disponible: ${articulo.stock}`,
        });
      }

      const subtotal = articulo.precio * item.cantidad;
      detalles.push({
        articuloId: articulo.id,
        nombre: articulo.nombre,
        cantidad: item.cantidad,
        precioUnitario: articulo.precio,
        subtotal,
      });

      total += subtotal;

      // Actualizar stock
      await fetch(`http://localhost:3000/api/articulos/${articulo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...articulo,
          stock: articulo.stock - item.cantidad,
        }),
      });
    }

    const nuevaVenta: Venta = {
      id: ventas.length + 1,
      fecha: new Date().toISOString(),
      articulos: detalles,
      total,
      metodoPago,
    };

    ventas.push(nuevaVenta);
    res.status(201).json(nuevaVenta);
  } catch (error) {
    res.status(500).json({ message: "Error al procesar la venta", error });
  }
});

/**
 * @swagger
 * /api/ventas/{id}:
 *   delete:
 *     summary: Eliminar venta
 *     tags: [Ventas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Venta eliminada
 */
router.delete("/:id", (req: Request, res: Response) => {
  const index = ventas.findIndex((v) => v.id === parseInt(req.params.id));
  if (index !== -1) {
    const eliminada = ventas.splice(index, 1);
    res.json({ message: "Venta eliminada", venta: eliminada[0] });
  } else {
    res.status(404).json({ message: "Venta no encontrada" });
  }
});

export { router as ventasRouter };
