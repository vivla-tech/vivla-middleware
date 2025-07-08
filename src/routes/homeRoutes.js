import express from 'express';
import { getHousesListController } from '../controllers/homeController.js';

const router = express.Router();

/**
 * @swagger
 * /homes/list:
 *   get:
 *     summary: Obtener listado de todas las casas
 *     description: Obtiene el listado de todas las casas disponibles con solo los campos hid y name
 *     tags:
 *       - Casas
 *     responses:
 *       200:
 *         description: Listado de casas obtenido exitosamente
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
 *                   example: Listado de casas obtenido exitosamente
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       hid:
 *                         type: string
 *                         description: ID único de la casa
 *                         example: "39121124"
 *                       name:
 *                         type: string
 *                         description: Nombre de la casa
 *                         example: "Casa Saona"
 *                       is_test_home:
 *                         type: boolean
 *                         description: Indica si es una casa de prueba
 *                         example: false
 *                 count:
 *                   type: integer
 *                   description: Número total de casas
 *                   example: 5
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
 *                   example: Error interno del servidor al obtener el listado de casas
 */
router.get('/list', getHousesListController);

export default router; 