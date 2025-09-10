import express from 'express';
import { getTicketByIdController, getTicketsController, getImprovementProposalTicketsController, getRepairTicketsController, getHomeRepairStatsController, getTicketsStatsController } from '../controllers/ticketController.js';

const router = express.Router();

/**
 * @swagger
 * /tickets:
 *   get:
 *     summary: Obtener lista de tickets
 *     description: Obtiene una lista paginada de tickets con opciones de ordenamiento
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           default: 25
 *         description: Número de elementos por página
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: created_at
 *         description: Campo por el cual ordenar
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Orden de clasificación
 *     responses:
 *       200:
 *         description: Lista de tickets obtenida exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', getTicketsController);

/**
 * @swagger
 * /tickets/stats:
 *   get:
 *     summary: Obtener estadísticas de tickets
 *     description: Obtiene estadísticas generales de los tickets
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.get('/stats', getTicketsStatsController);

/**
 * @swagger
 * /v1/tickets/improvement-proposals:
 *   get:
 *     summary: Obtener tickets de propuesta de mejora
 *     description: Obtiene una lista paginada de tickets filtrados por custom_status específico (18587461153436). Opcionalmente puede filtrar por casa específica.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           default: 25
 *         description: Número de elementos por página
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: created_at
 *         description: Campo por el cual ordenar
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Orden de clasificación
 *       - in: query
 *         name: home
 *         schema:
 *           type: string
 *         description: Nombre de la casa para filtrar (opcional)
 *         example: "Casa Ejemplo"
 *     responses:
 *       200:
 *         description: Lista de tickets de propuesta de mejora obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     tickets:
 *                       type: array
 *                       items:
 *                         type: object
 *                     count:
 *                       type: integer
 *                     next_page:
 *                       type: string
 *                       nullable: true
 *                     previous_page:
 *                       type: string
 *                       nullable: true
 *                     home_filter:
 *                       type: string
 *                       nullable: true
 *                       description: Nombre de la casa filtrada (si se aplicó filtro)
 *       500:
 *         description: Error interno del servidor
 */
router.get('/improvement-proposals', getImprovementProposalTicketsController);

/**
 * @swagger
 * /v1/tickets/repairs:
 *   get:
 *     summary: Obtener tickets de reparaciones
 *     description: Obtiene una lista paginada de tickets filtrados por custom field de reparaciones (17926767041308). Opcionalmente puede filtrar por casa específica.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           default: 25
 *         description: Número de elementos por página
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           default: created_at
 *         description: Campo por el cual ordenar
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Orden de clasificación
 *       - in: query
 *         name: home
 *         schema:
 *           type: string
 *         description: Nombre de la casa para filtrar (opcional)
 *         example: "Casa Ejemplo"
 *     responses:
 *       200:
 *         description: Lista de tickets de reparaciones obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     tickets:
 *                       type: array
 *                       items:
 *                         type: object
 *                     count:
 *                       type: integer
 *                     next_page:
 *                       type: string
 *                       nullable: true
 *                     previous_page:
 *                       type: string
 *                       nullable: true
 *                     home_filter:
 *                       type: string
 *                       nullable: true
 *                       description: Nombre de la casa filtrada (si se aplicó filtro)
 *       500:
 *         description: Error interno del servidor
 */
router.get('/repairs', getRepairTicketsController);

/**
 * @swagger
 * /v1/tickets/home-repair-stats/{homeName}:
 *   get:
 *     summary: Obtener estadísticas de reparaciones por casa
 *     description: Obtiene estadísticas de tickets de reparaciones para una casa específica, contando por cada tipo de custom field de reparaciones
 *     parameters:
 *       - in: path
 *         name: homeName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de la casa
 *     responses:
 *       200:
 *         description: Estadísticas de reparaciones obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     home_name:
 *                       type: string
 *                       example: "Casa Ejemplo"
 *                     total_tickets:
 *                       type: integer
 *                       example: 15
 *                     repair_stats:
 *                       type: object
 *                       example:
 *                         "comunicado_a_propietario": 8
 *                         "en_proceso": 4
 *                         "completado": 3
 *       400:
 *         description: Nombre de casa requerido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/home-repair-stats/:homeName', getHomeRepairStatsController);

/**
 * @swagger
 * /tickets/{id}:
 *   get:
 *     summary: Obtener ticket por ID
 *     description: Obtiene un ticket específico por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del ticket
 *     responses:
 *       200:
 *         description: Ticket encontrado
 *       404:
 *         description: Ticket no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', getTicketByIdController);

export default router; 