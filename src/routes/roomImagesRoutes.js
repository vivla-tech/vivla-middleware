import express from 'express';
import { getRoomImagesController } from '../controllers/roomImagesController.js';

const router = express.Router();

/**
 * @swagger
 * /v1/homes/{hid}/room-images:
 *   get:
 *     summary: Obtener imágenes de habitaciones de una casa específica
 *     description: Obtiene las imágenes de habitaciones de una casa basándose en su hid (ID único de la casa). Busca en la colección nps-home-data y devuelve solo los campos que empiecen por "img", quitando ese prefijo.
 *     tags:
 *       - Imágenes de Habitaciones
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
 *         description: Imágenes de habitaciones obtenidas exitosamente
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
 *                   example: Imágenes de habitaciones obtenidas exitosamente desde nps-home-data
 *                 data:
 *                   type: object
 *                   properties:
 *                     hid:
 *                       type: string
 *                       description: ID único de la casa
 *                       example: "39121124"
 *                     documentId:
 *                       type: string
 *                       description: ID del documento en Firestore
 *                       example: "abc123def456"
 *                     roomImages:
 *                       type: object
 *                       description: Objeto con imágenes de habitaciones (campos que empiezan por 'img' sin el prefijo)
 *                       additionalProperties: true
 *                       example:
 *                         cocina: "https://example.com/images/cocina.jpg"
 *                         baño: "https://example.com/images/baño.jpg"
 *                         salon: "https://example.com/images/salon.jpg"
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
 *                   example: Error interno del servidor al obtener imágenes de habitaciones
 */
router.get('/:hid/room-images', getRoomImagesController);

export default router;
