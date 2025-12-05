import express from 'express';
import { getZendeskUserTicketsController } from '../controllers/zendeskUserController.js';

const router = express.Router();

/**
 * @swagger
 * /zendesk-user-tickets/{userId}:
 *   get:
 *     summary: Obtener tickets solicitados por un usuario de Zendesk
 *     description: Obtiene una lista paginada de tickets que fueron solicitados por un usuario específico de Zendesk usando su ID.
 *     tags:
 *       - Zendesk Users
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID del usuario en Zendesk
 *         schema:
 *           type: integer
 *           example: 123456
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
 *           default: 25
 *           minimum: 1
 *           maximum: 100
 *         description: Número de elementos por página (máximo 100)
 *       - in: query
 *         name: home
 *         required: false
 *         schema:
 *           type: string
 *         description: Nombre de la casa para filtrar los tickets (opcional)
 *         example: "saona"
 *     responses:
 *       200:
 *         description: Lista de tickets obtenida exitosamente
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
 *                   example: Tickets obtenidos exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     tickets:
 *                       type: array
 *                       items:
 *                         type: object
 *                         description: Objeto ticket con todos sus campos según la API de Zendesk
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: ID único del ticket
 *                           subject:
 *                             type: string
 *                             description: Asunto del ticket
 *                           status:
 *                             type: string
 *                             description: Estado del ticket
 *                           priority:
 *                             type: string
 *                             description: Prioridad del ticket
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             description: Fecha de creación del ticket
 *                           updated_at:
 *                             type: string
 *                             format: date-time
 *                             description: Fecha de última actualización
 *                           requester_id:
 *                             type: integer
 *                             description: ID del usuario que solicitó el ticket
 *                     count:
 *                       type: integer
 *                       description: Número total de tickets
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
 *                     user_id:
 *                       type: integer
 *                       description: ID del usuario consultado
 *                     home:
 *                       type: string
 *                       nullable: true
 *                       description: Nombre de la casa filtrada (null si no se aplicó filtro)
 *                       example: "saona"
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
 *                   example: El ID del usuario debe ser un número entero positivo
 *                 data:
 *                   type: null
 *       404:
 *         description: Usuario no encontrado en Zendesk
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
 *                   example: No se encontró el usuario con ID: 123456
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
 *                   example: Error interno del servidor al obtener tickets del usuario
 */
router.get('/:userId', getZendeskUserTicketsController);

export default router;

