import express from 'express';
import { getZendeskUsersController } from '../controllers/zendeskUserController.js';

const router = express.Router();

/**
 * @swagger
 * /zendesk-users:
 *   get:
 *     summary: Obtener lista de usuarios de Zendesk
 *     description: Obtiene una lista paginada de usuarios de Zendesk. Por defecto filtra por usuarios end-user (clientes).
 *     tags:
 *       - Zendesk Users
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Número de página
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           default: 100
 *           minimum: 1
 *           maximum: 100
 *         description: Número de elementos por página (máximo 100)
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [end-user, agent, admin]
 *           default: end-user
 *         description: Rol del usuario a filtrar. Por defecto 'end-user'
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Usuarios obtenidos exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         description: Objeto usuario con todos sus campos según la API de Zendesk
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: ID único del usuario
 *                           name:
 *                             type: string
 *                             description: Nombre del usuario
 *                           email:
 *                             type: string
 *                             description: Email del usuario
 *                           role:
 *                             type: string
 *                             description: Rol del usuario (end-user, agent, admin)
 *                           active:
 *                             type: boolean
 *                             description: Si el usuario está activo
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             description: Fecha de creación del usuario
 *                           updated_at:
 *                             type: string
 *                             format: date-time
 *                             description: Fecha de última actualización
 *                     count:
 *                       type: integer
 *                       description: Número total de usuarios
 *                     next_page:
 *                       type: string
 *                       nullable: true
 *                       description: URL de la siguiente página (null si no hay más páginas)
 *                     previous_page:
 *                       type: string
 *                       nullable: true
 *                       description: URL de la página anterior (null si es la primera página)
 *                     page:
 *                       type: integer
 *                       description: Página actual
 *                     per_page:
 *                       type: integer
 *                       description: Elementos por página
 *                     role:
 *                       type: string
 *                       description: Rol filtrado
 *       400:
 *         description: Error de validación en los parámetros
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: El parámetro page debe ser un número mayor a 0
 *                 data:
 *                   type: null
 *       401:
 *         description: Error de autenticación con Zendesk
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Error de autenticación
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Error interno del servidor al obtener usuarios de Zendesk
 */
router.get('/', getZendeskUsersController);

export default router;

