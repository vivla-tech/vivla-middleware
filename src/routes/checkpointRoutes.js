import express from 'express';
import { getCheckpointsController } from '../controllers/checkpointController.js';

const router = express.Router();

/**
 * @swagger
 * /checkpoints:
 *   get:
 *     summary: Obtener checkPoints de las casas
 *     description: Obtiene la información de checkPoints de todas las casas, incluyendo checkPoints de propietarios y Home Excellence con sus respectivas fechas. También incluye datos agregados calculados basándose en la fecha actual (completados, en curso, pendientes y totales).
 *     responses:
 *       200:
 *         description: CheckPoints obtenidos exitosamente
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
 *                       OwnersCheckPointCount:
 *                         type: integer
 *                         description: Número de checkPoints de propietarios
 *                         example: 2
 *                       OwnersCheckPointDates:
 *                         type: array
 *                         items:
 *                           type: string
 *                           format: date
 *                         description: Fechas de los checkPoints de propietarios
 *                         example: ["2025-02-10", "2025-01-21"]
 *                       HXCheckPointCount:
 *                         type: integer
 *                         description: Número de checkPoints de Home Excellence
 *                         example: 2
 *                       HXCheckPointDates:
 *                         type: array
 *                         items:
 *                           type: string
 *                           format: date
 *                         description: Fechas de los checkPoints de Home Excellence
 *                         example: ["2025-08-21", "2025-09-08"]
 *                 count:
 *                   type: integer
 *                   description: Número total de casas
 *                   example: 25
 *                 aggregated:
 *                   type: object
 *                   description: Datos agregados de checkPoints calculados basándose en la fecha actual
 *                   properties:
 *                     owners:
 *                       type: object
 *                       description: Estadísticas de checkPoints de propietarios
 *                       properties:
 *                         completed:
 *                           type: integer
 *                           description: CheckPoints completados (fecha anterior a hoy)
 *                           example: 45
 *                         inProgress:
 *                           type: integer
 *                           description: CheckPoints en curso (fecha igual a hoy)
 *                           example: 2
 *                         pending:
 *                           type: integer
 *                           description: CheckPoints pendientes (fecha posterior a hoy)
 *                           example: 8
 *                         total:
 *                           type: integer
 *                           description: Total de checkPoints de propietarios
 *                           example: 55
 *                     hx:
 *                       type: object
 *                       description: Estadísticas de checkPoints de Home Excellence
 *                       properties:
 *                         completed:
 *                           type: integer
 *                           description: CheckPoints completados (fecha anterior a hoy)
 *                           example: 42
 *                         inProgress:
 *                           type: integer
 *                           description: CheckPoints en curso (fecha igual a hoy)
 *                           example: 1
 *                         pending:
 *                           type: integer
 *                           description: CheckPoints pendientes (fecha posterior a hoy)
 *                           example: 12
 *                         total:
 *                           type: integer
 *                           description: Total de checkPoints de Home Excellence
 *                           example: 55
 *                     total:
 *                       type: object
 *                       description: Estadísticas totales de todos los checkPoints
 *                       properties:
 *                         completed:
 *                           type: integer
 *                           description: CheckPoints completados (fecha anterior a hoy)
 *                           example: 87
 *                         inProgress:
 *                           type: integer
 *                           description: CheckPoints en curso (fecha igual a hoy)
 *                           example: 3
 *                         pending:
 *                           type: integer
 *                           description: CheckPoints pendientes (fecha posterior a hoy)
 *                           example: 20
 *                         total:
 *                           type: integer
 *                           description: Total de todos los checkPoints
 *                           example: 110
 *                 currentDate:
 *                   type: string
 *                   format: date
 *                   description: Fecha actual utilizada para los cálculos
 *                   example: "2025-01-15"
 *                 message:
 *                   type: string
 *                   example: "CheckPoints de las casas obtenidos exitosamente"
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', getCheckpointsController);

export default router;
