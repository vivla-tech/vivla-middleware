import express from 'express';
import { getTicketById, getTickets, getTicketsStats } from '../controllers/ticketController.js';

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
router.get('/', getTickets);

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
router.get('/:id', getTicketById);

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
router.get('/stats', getTicketsStats);

export default router; 