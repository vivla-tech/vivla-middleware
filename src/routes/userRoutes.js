import express from 'express';
import { getUserDealsByEmailController } from '../controllers/userController.js';

const router = express.Router();

/**
 * @swagger
 * /users/deals/{email}:
 *   get:
 *     summary: Obtener deals de un usuario por email
 *     description: Obtiene todos los deals de un usuario específico a partir de su email, incluyendo información de las casas asociadas
 *     tags:
 *       - Usuarios
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         description: Email del usuario (ej. usuario@ejemplo.com)
 *         schema:
 *           type: string
 *           format: email
 *     responses:
 *       200:
 *         description: Deals del usuario obtenidos exitosamente
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
 *                   example: Deals obtenidos exitosamente para usuario@ejemplo.com
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: ID del deal
 *                       hid:
 *                         type: string
 *                         description: ID de la casa
 *                       house_name:
 *                         type: string
 *                         description: Nombre de la casa
 *                       uid:
 *                         type: string
 *                         description: ID del usuario
 *                       # Otros campos del deal según la estructura de datos
 *                 count:
 *                   type: integer
 *                   description: Número total de deals
 *                 user:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       description: Email del usuario
 *                     uid:
 *                       type: string
 *                       description: ID único del usuario
 *       400:
 *         description: Email no proporcionado o formato inválido
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
 *                   example: El formato del email no es válido
 *       404:
 *         description: Usuario no encontrado
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
 *                   example: No se encontró un usuario con el email: usuario@ejemplo.com
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
 *                   example: Error interno del servidor al procesar la solicitud
 */
router.get('/deals/:email', getUserDealsByEmailController);

export default router; 