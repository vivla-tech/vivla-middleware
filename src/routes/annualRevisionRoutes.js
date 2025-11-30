import express from 'express';
import { getAnnualRevisionController } from '../controllers/annualRevisionController.js';

const router = express.Router();

/**
 * @swagger
 * /getAnnualHomeRevision:
 *   get:
 *     summary: Obtener revisión anual de las casas
 *     description: Obtiene la información de la revisión anual de todas las casas. Cada casa tiene una única fecha de revisión anual para el año en curso. También incluye datos agregados calculados basándose en la fecha actual (completadas, en curso, pendientes y totales). Opcionalmente se puede filtrar por nombre de casa usando el query parameter homeName.
 *     parameters:
 *       - in: query
 *         name: homeName
 *         required: false
 *         schema:
 *           type: string
 *         description: Nombre de la casa para filtrar los resultados. Primero busca coincidencias exactas (case-insensitive), si no encuentra ninguna, busca coincidencias parciales.
 *         example: "Saona"
 *     responses:
 *       200:
 *         description: Revisión anual obtenida exitosamente
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
 *                     type: object
 *                     properties:
 *                       HomeName:
 *                         type: string
 *                         description: Nombre de la casa
 *                         example: "Fir"
 *                       AnnualRevisionDate:
 *                         type: string
 *                         format: date
 *                         description: Fecha de la revisión anual para el año en curso
 *                         example: "2025-06-15"
 *                       status:
 *                         type: string
 *                         description: Estado de la revisión basado en la fecha actual
 *                         enum: [completed, inProgress, pending]
 *                         example: "pending"
 *                 count:
 *                   type: integer
 *                   description: Número total de casas
 *                   example: 24
 *                 aggregated:
 *                   type: object
 *                   description: Datos agregados de revisiones anuales calculados basándose en la fecha actual
 *                   properties:
 *                     completed:
 *                       type: integer
 *                       description: Revisiones completadas (fecha anterior a hoy)
 *                       example: 8
 *                     inProgress:
 *                       type: integer
 *                       description: Revisiones en curso (fecha igual a hoy)
 *                       example: 0
 *                     pending:
 *                       type: integer
 *                       description: Revisiones pendientes (fecha posterior a hoy)
 *                       example: 16
 *                     total:
 *                       type: integer
 *                       description: Total de revisiones anuales
 *                       example: 24
 *                 currentDate:
 *                   type: string
 *                   format: date
 *                   description: Fecha actual utilizada para los cálculos
 *                   example: "2025-01-15"
 *                 message:
 *                   type: string
 *                   example: "Revisiones anuales de las casas obtenidas exitosamente"
 *                 filter:
 *                   type: object
 *                   description: Información del filtro aplicado (solo presente cuando se usa homeName)
 *                   properties:
 *                     homeName:
 *                       type: string
 *                       description: Nombre de casa usado para filtrar
 *                       example: "Saona"
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', getAnnualRevisionController);

export default router;

