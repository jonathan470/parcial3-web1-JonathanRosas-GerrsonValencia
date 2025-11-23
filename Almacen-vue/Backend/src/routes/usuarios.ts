import { Router, Request, Response } from "express";

const router = Router();

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  password: string;
}

let usuarios: Usuario[] = [
  { id: 1, nombre: "Admin", email: "admin@almacen.com", password: "admin123" },
];

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       required:
 *         - nombre
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: integer
 *         nombre:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 */

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get("/", (req: Request, res: Response) => {
  res.json(usuarios);
});

/**
 * @swagger
 * /api/usuarios/login:
 *   post:
 *     summary: Login de usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 */
router.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body;
  const usuario = usuarios.find(
    (u) => u.email === email && u.password === password
  );

  if (usuario) {
    res.json({
      success: true,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
    });
  } else {
    res.status(401).json({ success: false, message: "Credenciales inválidas" });
  }
});

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Crear nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       201:
 *         description: Usuario creado
 */
router.post("/", (req: Request, res: Response) => {
  const nuevoUsuario: Usuario = {
    id: usuarios.length + 1,
    ...req.body,
  };
  usuarios.push(nuevoUsuario);
  res.status(201).json(nuevoUsuario);
});

export { router as usuariosRouter };
