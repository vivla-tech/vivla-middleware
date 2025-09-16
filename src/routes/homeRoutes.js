import express from 'express';
import { getHousesListController, getHousesWithDashboardController } from '../controllers/homeController.js';

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
 *                       zendesk_name:
 *                         type: string
 *                         nullable: true
 *                         description: Nombre más similar encontrado en Zendesk
 *                         example: "Casa Saona"
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

/**
 * @swagger
 * /homes/list-with-dashboard:
 *   get:
 *     summary: Obtener listado de casas combinando Firebase y Dashboard
 *     description: Obtiene el listado de todas las casas combinando datos de Firebase con datos del dashboard, matcheando por hid/foreignId
 *     tags:
 *       - Casas
 *     responses:
 *       200:
 *         description: Listado de casas combinado obtenido exitosamente
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
 *                   example: Listado de casas con datos del dashboard obtenido exitosamente
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       hid:
 *                         type: string
 *                         description: ID único de la casa (Firebase)
 *                         example: "39121124"
 *                       name:
 *                         type: string
 *                         nullable: true
 *                         description: Nombre de la casa (Firebase)
 *                         example: "Casa Saona"
 *                       is_test_home:
 *                         type: boolean
 *                         description: Indica si es una casa de prueba (Firebase)
 *                         example: false
 *                       zendesk_name:
 *                         type: string
 *                         nullable: true
 *                         description: Nombre más similar encontrado en Zendesk
 *                         example: "Casa Saona"
 *                       main_image:
 *                         type: string
 *                         nullable: true
 *                         description: Imagen principal de la casa
 *                         example: "/path/to/image.jpg"
 *                       dashboard_name:
 *                         type: string
 *                         nullable: true
 *                         description: Nombre de la casa en el dashboard
 *                         example: "Casa Salaró Terrassa"
 *                       dashboard_id:
 *                         type: string
 *                         nullable: true
 *                         description: ID único en el dashboard
 *                         example: "b9b9a32b-de69-4979-a181-02dcbf511128"
 *                       dashboard_foreignId:
 *                         type: string
 *                         nullable: true
 *                         description: ID foráneo en el dashboard (matchea con hid)
 *                         example: "42026524"
 *                       dashboard_image:
 *                         type: string
 *                         nullable: true
 *                         description: Imagen de la casa en base64
 *                         example: "data:image/png;base64,..."
 *                       dashboard_area:
 *                         type: string
 *                         nullable: true
 *                         description: Área de la casa
 *                         example: "Baqueira"
 *                       dashboard_createdAt:
 *                         type: string
 *                         nullable: true
 *                         format: date-time
 *                         description: Fecha de creación en el dashboard
 *                         example: "2025-06-16T14:56:22.254Z"
 *                       dashboard_updatedAt:
 *                         type: string
 *                         nullable: true
 *                         format: date-time
 *                         description: Fecha de actualización en el dashboard
 *                         example: "2025-06-16T14:56:22.254Z"
 *                       is_home_in_zendesk:
 *                         type: boolean
 *                         description: Indica si la casa está presente en Zendesk (basado en zendesk_name)
 *                         example: true
 *                       is_home_in_nps_dashboard:
 *                         type: boolean
 *                         description: Indica si la casa está presente en el dashboard NPS (basado en match con dashboard_name)
 *                         example: true
 *                 count:
 *                   type: integer
 *                   description: Número total de casas combinadas
 *                   example: 8
 *                 sources:
 *                   type: object
 *                   description: Información sobre las fuentes de datos
 *                   properties:
 *                     firebase_count:
 *                       type: integer
 *                       description: Número de casas de Firebase
 *                       example: 5
 *                     dashboard_count:
 *                       type: integer
 *                       description: Número de propiedades del dashboard
 *                       example: 6
 *                     merged_count:
 *                       type: integer
 *                       description: Número total de casas combinadas
 *                       example: 8
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
 *                   example: Error interno del servidor al obtener el listado de casas con datos del dashboard
 */
router.get('/list-with-dashboard', getHousesWithDashboardController);

export default router; 