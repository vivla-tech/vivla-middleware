import express from 'express';
import { getHomeStaysStatsController } from '../controllers/staysController.js';
import { getInspectionDatesController } from '../controllers/inspectionController.js';

const router = express.Router();

/**
 * @swagger
 * /stays/{hid}/stats:
 *   get:
 *     summary: Obtener estadísticas de estancias de una casa específica
 *     description: Obtiene estadísticas de las estancias (books) con status 'booked' de una casa específica, agrupadas por el campo 'progress'
 *     tags:
 *       - Estancias
 *     parameters:
 *       - in: path
 *         name: hid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único de la casa
 *         example: "39121124"
 *     responses:
 *       200:
 *         description: Estadísticas de estancias obtenidas exitosamente
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
 *                   example: Estadísticas de estancias obtenidas exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     hid:
 *                       type: string
 *                       description: ID único de la casa
 *                       example: "39121124"
 *                     homeName:
 *                       type: string
 *                       nullable: true
 *                       description: Nombre de la casa
 *                       example: "Casa Saona"
 *                     homeId:
 *                       type: string
 *                       description: ID del documento en Firebase
 *                       example: "abc123def456"
 *                     totalBookedStays:
 *                       type: integer
 *                       description: Total de estancias con status 'booked'
 *                       example: 15
 *                     progressStats:
 *                       type: object
 *                       description: Estadísticas agrupadas por tipo de progress
 *                       properties:
 *                         pending:
 *                           type: integer
 *                           description: Número de estancias con progress 'pending'
 *                           example: 5
 *                         confirmed:
 *                           type: integer
 *                           description: Número de estancias con progress 'confirmed'
 *                           example: 8
 *                         completed:
 *                           type: integer
 *                           description: Número de estancias con progress 'completed'
 *                           example: 2
 *       400:
 *         description: Parámetro hid requerido
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
 *                   example: El parámetro hid es requerido
 *       404:
 *         description: Casa no encontrada
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
 *                   example: Casa no encontrada
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
 *                   example: Error interno del servidor al obtener estadísticas de estancias
 */
router.get('/:hid/stats', getHomeStaysStatsController);

/**
 * @swagger
 * /stays/{hid}/inspections:
 *   get:
 *     summary: Obtener fechas de inspección de una casa específica
 *     description: Obtiene las fechas de inspección de una casa basándose en su tipo (beach, ski, city). Las fechas se clasifican en past, now y future según la fecha actual.
 *     tags:
 *       - Inspecciones
 *     parameters:
 *       - in: path
 *         name: hid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único de la casa
 *         example: "39121124"
 *     responses:
 *       200:
 *         description: Fechas de inspección obtenidas exitosamente
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
 *                   example: Fechas de inspección obtenidas exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     hid:
 *                       type: string
 *                       description: ID único de la casa
 *                       example: "39121124"
 *                     homeName:
 *                       type: string
 *                       nullable: true
 *                       description: Nombre de la casa
 *                       example: "Casa Saona"
 *                     homeType:
 *                       type: string
 *                       description: Tipo de la casa
 *                       enum: [beach, ski, city]
 *                       example: "beach"
 *                     dates:
 *                       type: array
 *                       description: Todas las fechas de inspección configuradas para este tipo de casa
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                             description: Fecha de inspección
 *                             example: "2025-06-01"
 *                           description:
 *                             type: string
 *                             description: Descripción de la inspección
 *                             example: "Inspección de verano"
 *                     past:
 *                       type: array
 *                       description: Fechas de inspección que ya pasaron
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                             example: "2025-04-01"
 *                           description:
 *                             type: string
 *                             example: "Inspección post-temporada"
 *                     now:
 *                       type: array
 *                       description: Fechas de inspección que son hoy
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                             example: "2025-06-01"
 *                           description:
 *                             type: string
 *                             example: "Inspección de verano"
 *                     future:
 *                       type: array
 *                       description: Fechas de inspección futuras
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                             example: "2025-12-01"
 *                           description:
 *                             type: string
 *                             example: "Inspección de invierno"
 *                     currentDate:
 *                       type: string
 *                       format: date
 *                       description: Fecha actual utilizada para la clasificación
 *                       example: "2025-01-15"
 *       400:
 *         description: Parámetro hid requerido o tipo de casa no válido
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
 *                   example: El parámetro hid es requerido
 *       404:
 *         description: Casa no encontrada
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
 *                   example: Casa no encontrada
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
 *                   example: Error interno del servidor al obtener fechas de inspección
 */
router.get('/:hid/inspections', getInspectionDatesController);

export default router;
