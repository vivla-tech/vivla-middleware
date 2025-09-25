import express from 'express';
import proposalController from '../controllers/proposalController.js';
import upload, { validateFiles } from '../middleware/fileUpload.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Proposal:
 *       type: object
 *       required:
 *         - proposal
 *         - investment
 *         - hid
 *       properties:
 *         proposal:
 *           type: string
 *           description: Descripción de la propuesta de mejora
 *           minLength: 10
 *           example: "La piscina debería tener más iluminación"
 *         investment:
 *           type: string
 *           description: Rango de inversión estimada
 *           enum: ["0-100", "100-500", "500-1000", "1000-5000", "5000+"]
 *           example: "100-500"
 *         hid:
 *           type: string
 *           description: ID del hogar (Home ID)
 *           example: "home_12345"
 *         files:
 *           type: array
 *           items:
 *             type: string
 *             format: binary
 *           description: Archivos adjuntos (máximo 5)
 *           maxItems: 5
 *     
 *     ProposalResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         proposalId:
 *           type: string
 *           description: ID único de la propuesta
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         fileUrls:
 *           type: array
 *           items:
 *             type: string
 *           description: URLs de los archivos subidos
 *           example: ["https://firebasestorage.googleapis.com/..."]
 *         message:
 *           type: string
 *           example: "Propuesta creada exitosamente"
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Error message"
 *         errors:
 *           type: array
 *           items:
 *             type: string
 *           description: Array de errores de validación
 */

/**
 * @swagger
 * /api/proposals:
 *   post:
 *     summary: Crear una nueva propuesta de mejora de hogar
 *     tags: [Proposals]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - proposal
 *               - investment
 *               - hid
 *             properties:
 *               proposal:
 *                 type: string
 *                 description: Descripción de la propuesta (mínimo 10 caracteres)
 *                 example: "La piscina debería tener más iluminación"
 *               investment:
 *                 type: string
 *                 description: Rango de inversión estimada
 *                 enum: ["0-100", "100-500", "500-1000", "1000-5000", "5000+"]
 *                 example: "100-500"
 *               hid:
 *                 type: string
 *                 description: ID del hogar (Home ID)
 *                 example: "home_12345"
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Archivos adjuntos (máximo 5, tipos: jpg, png, pdf, doc, docx)
 *                 maxItems: 5
 *     responses:
 *       201:
 *         description: Propuesta creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProposalResponse'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       413:
 *         description: Archivos demasiado grandes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', 
    upload.array('files', 5), // Máximo 5 archivos
    validateFiles,
    proposalController.handleMulterError,
    proposalController.createProposal
);

/**
 * @swagger
 * /api/proposals:
 *   get:
 *     summary: Obtener todas las propuestas
 *     tags: [Proposals]
 *     responses:
 *       200:
 *         description: Lista de propuestas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 proposals:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: ID del documento en Firestore
 *                       proposal:
 *                         type: string
 *                         description: Descripción de la propuesta
 *                       investment:
 *                         type: string
 *                         description: Rango de inversión
 *                       files:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             fileName:
 *                               type: string
 *                             originalName:
 *                               type: string
 *                             url:
 *                               type: string
 *                             size:
 *                               type: number
 *                             mimeType:
 *                               type: string
 *                       createdAt:
 *                         type: object
 *                         description: Timestamp de creación
 *                       status:
 *                         type: string
 *                         example: "pending"
 *                       proposalId:
 *                         type: string
 *                         description: ID único de la propuesta
 *                 count:
 *                   type: number
 *                   description: Número total de propuestas
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', proposalController.getAllProposals);

export default router;
