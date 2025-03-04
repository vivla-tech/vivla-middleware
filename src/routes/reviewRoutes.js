import express from 'express';
import { getReviews } from '../controllers/reviewController.js';

const router = express.Router();

/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: Obtener reviews
 *     description: Obtiene una lista de reviews con opciones de filtrado
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [home, stay]
 *         description: Tipo de review (home o stay)
 *       - in: query
 *         name: houseName
 *         schema:
 *           type: string
 *         description: Nombre de la casa para filtrar reviews
 *     responses:
 *       200:
 *         description: Lista de reviews obtenida exitosamente
 *       400:
 *         description: Parámetros de filtrado inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', getReviews);

export default router; 