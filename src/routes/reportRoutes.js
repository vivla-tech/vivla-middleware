import express from 'express';
import { getReportListController, getReportByHomeIdController, getReportByUserIdController } from '../controllers/reportController.js';

const router = express.Router();

/**
 * @swagger
 * /report/2024/list:
 *   get:
 *     summary: Obtener lista de reportes de 2024
 *     description: Obtiene todos los datos de reportes anuales para el año 2024
 *     tags:
 *       - Reportes
 *     responses:
 *       200:
 *         description: Lista de reportes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Report'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/2024/list', getReportListController);

/**
 * @swagger
 * /report/2024/home/{homeId}:
 *   get:
 *     summary: Obtener reportes de una casa específica
 *     description: Obtiene los reportes de 2024 para una casa específica según su ID
 *     tags:
 *       - Reportes
 *     parameters:
 *       - in: path
 *         name: homeId
 *         required: true
 *         description: ID de la casa (ej. Saona, Fir)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reportes de la casa obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Report'
 *       404:
 *         description: No se encontraron reportes para la casa especificada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/2024/home/:homeId', getReportByHomeIdController);

/**
 * @swagger
 * /report/2024/user/{userId}:
 *   get:
 *     summary: Obtener reportes de un usuario específico
 *     description: Obtiene los reportes de 2024 para un usuario específico según su ID
 *     tags:
 *       - Reportes
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID del usuario (ej. cmF1bEB2aXZsYS5jb20=)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reportes del usuario obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Report'
 *       404:
 *         description: No se encontraron reportes para el usuario especificado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/2024/user/:userId', getReportByUserIdController);

export default router; 