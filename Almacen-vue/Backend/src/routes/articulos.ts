import { Router, Request, Response } from "express";

const router = Router();

interface Articulo {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
}

let articulos: Articulo[] = [];

/**
 * @swagger
 * components:
 *   schemas:
 *     Articulo:
 *       type: object
 *       required:
 *         - nombre
 *         - descripcion
 *         - precio
 *         - stock
 *       properties:
 *         id:
 *           type: integer
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *         precio:
 *           type: number
 *         stock:
 *           type: integer
 */

/**
 * @swagger
 * /api/articulos:
 *   get:
 *     summary: Obtener todos los artículos
 *     tags: [Articulos]
 *     responses:
 *       200:
 *         description: Lista de artículos
 */
router.get("/", (req: Request, res: Response) => {
  res.json(articulos);
});

/**
 * @swagger
 * /api/articulos/disponibles:
 *   get:
 *     summary: Obtener artículos disponibles (stock > 0)
 *     tags: [Articulos]
 *     responses:
 *       200:
 *         description: Lista de artículos disponibles
 */
router.get("/disponibles", (req: Request, res: Response) => {
  const disponibles = articulos.filter((a) => a.stock > 0);
  res.json(disponibles);
});

/**
 * @swagger
 * /api/articulos/{id}:
 *   get:
 *     summary: Obtener un artículo por ID
 *     tags: [Articulos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Artículo encontrado
 *       404:
 *         description: Artículo no encontrado
 */
router.get("/:id", (req: Request, res: Response) => {
  const articulo = articulos.find((a) => a.id === parseInt(req.params.id));
  if (articulo) {
    res.json(articulo);
  } else {
    res.status(404).json({ message: "Artículo no encontrado" });
  }
});

/**
 * @swagger
 * /api/articulos:
 *   post:
 *     summary: Crear nuevo artículo
 *     tags: [Articulos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Articulo'
 *     responses:
 *       201:
 *         description: Artículo creado
 */
router.post("/", (req: Request, res: Response) => {
  const nuevoArticulo: Articulo = {
    id: articulos.length + 1,
    nombre: req.body.nombre,
    descripcion: req.body.descripcion,
    precio: parseFloat(req.body.precio),
    stock: parseInt(req.body.stock),
  };
  articulos.push(nuevoArticulo);
  res.status(201).json(nuevoArticulo);
});

/**
 * @swagger
 * /api/articulos/{id}:
 *   put:
 *     summary: Actualizar artículo
 *     tags: [Articulos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Articulo'
 *     responses:
 *       200:
 *         description: Artículo actualizado
 *       404:
 *         description: Artículo no encontrado
 */
router.put("/:id", (req: Request, res: Response) => {
  const index = articulos.findIndex((a) => a.id === parseInt(req.params.id));
  if (index !== -1) {
    articulos[index] = {
      ...articulos[index],
      nombre: req.body.nombre,
      descripcion: req.body.descripcion,
      precio: parseFloat(req.body.precio),
      stock: parseInt(req.body.stock),
    };
    res.json(articulos[index]);
  } else {
    res.status(404).json({ message: "Artículo no encontrado" });
  }
});

/**
 * @swagger
 * /api/articulos/{id}:
 *   delete:
 *     summary: Eliminar artículo
 *     tags: [Articulos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Artículo eliminado
 *       404:
 *         description: Artículo no encontrado
 */
router.delete("/:id", (req: Request, res: Response) => {
  const index = articulos.findIndex((a) => a.id === parseInt(req.params.id));
  if (index !== -1) {
    const eliminado = articulos.splice(index, 1);
    res.json({ message: "Artículo eliminado", articulo: eliminado[0] });
  } else {
    res.status(404).json({ message: "Artículo no encontrado" });
  }
});

export { router as articulosRouter };
