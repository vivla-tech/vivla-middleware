import express from 'express';
import { getHomeTicketsRequestersController } from '../controllers/zendeskUserController.js';

const router = express.Router();

/**
 * @swagger
 * /home-tickets-requesters:
 *   get:
 *     summary: Obtener listado de usuarios que han creado tickets en una casa específica
 *     description: Obtiene un listado completo de usuarios (requesters) que han creado tickets en una casa específica, con el conteo de tickets por usuario. Opcionalmente puede filtrar por fecha de inicio.
 *     tags:
 *       - Zendesk Users
 *     parameters:
 *       - in: query
 *         name: home
 *         required: true
 *         description: Nombre de la casa (obligatorio)
 *         schema:
 *           type: string
 *           example: "saona"
 *       - in: query
 *         name: from
 *         required: false
 *         description: Fecha desde la cual filtrar tickets (formato YYYY-MM-DD). Si no se proporciona, se obtienen todos los tickets de la casa.
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-09-01"
 *     responses:
 *       200:
 *         description: Listado de requesters obtenido exitosamente
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
 *                   example: Requesters obtenidos exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     home:
 *                       type: string
 *                       description: Nombre de la casa consultada
 *                       example: "saona"
 *                     from:
 *                       type: string
 *                       nullable: true
 *                       description: Fecha desde la cual se filtraron los tickets (null si no se aplicó filtro)
 *                       example: "2025-09-01"
 *                     requesters:
 *                       type: array
 *                       description: Lista de usuarios ordenada por cantidad de tickets (descendente)
 *                       items:
 *                         type: object
 *                         properties:
 *                           requester_id:
 *                             type: integer
 *                             description: ID del usuario en Zendesk
 *                             example: 123456
 *                           requester_name:
 *                             type: string
 *                             description: Nombre del usuario
 *                             example: "Juan Pérez"
 *                           count:
 *                             type: integer
 *                             description: Número de tickets creados por este usuario en la casa
 *                             example: 5
 *                     total_requesters:
 *                       type: integer
 *                       description: Número total de usuarios únicos que han creado tickets
 *                       example: 10
 *                     total_tickets:
 *                       type: integer
 *                       description: Número total de tickets en la casa (con filtros aplicados)
 *                       example: 25
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
 *                   example: El parámetro home es obligatorio
 *                 data:
 *                   type: null
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
 *                   example: Error interno del servidor al obtener requesters de tickets
 */
router.get('/', getHomeTicketsRequestersController);

export default router;

