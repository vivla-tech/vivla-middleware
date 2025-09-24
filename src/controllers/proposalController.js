import proposalService from '../services/proposalService.js';

class ProposalController {
    /**
     * Crea una nueva propuesta de mejora de hogar
     * POST /api/proposals
     */
    async createProposal(req, res) {
        try {
            const { proposal, investment } = req.body;
            const files = req.files || [];

            // Validar que se proporcionen los datos requeridos
            if (!proposal || !investment) {
                return res.status(400).json({
                    success: false,
                    message: 'Los campos proposal e investment son requeridos'
                });
            }

            // Crear la propuesta usando el servicio
            const result = await proposalService.createProposal(
                { proposal, investment },
                files
            );

            if (!result.success) {
                // Determinar el código de estado apropiado
                let statusCode = 500;
                if (result.errors && result.errors.length > 0) {
                    statusCode = 400; // Datos inválidos
                } else if (result.message.includes('archivo')) {
                    statusCode = 413; // Archivo demasiado grande
                }

                return res.status(statusCode).json({
                    success: false,
                    message: result.message,
                    errors: result.errors || []
                });
            }

            // Respuesta exitosa
            res.status(201).json({
                success: true,
                proposalId: result.proposalId,
                fileUrls: result.fileUrls,
                message: result.message
            });

        } catch (error) {
            console.error('Error en createProposal:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Obtiene todas las propuestas
     * GET /api/proposals
     */
    async getAllProposals(req, res) {
        try {
            const result = await proposalService.getAllProposals();

            if (!result.success) {
                return res.status(500).json({
                    success: false,
                    message: result.message
                });
            }

            res.json({
                success: true,
                proposals: result.proposals,
                count: result.proposals.length
            });

        } catch (error) {
            console.error('Error en getAllProposals:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Maneja errores de multer
     */
    handleMulterError(error, req, res, next) {
        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({
                    success: false,
                    message: 'Archivo demasiado grande. Máximo 10MB por archivo'
                });
            }
            if (error.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({
                    success: false,
                    message: 'Demasiados archivos. Máximo 5 archivos permitidos'
                });
            }
            if (error.code === 'LIMIT_UNEXPECTED_FILE') {
                return res.status(400).json({
                    success: false,
                    message: 'Campo de archivo inesperado'
                });
            }
        }

        if (error.message.includes('Tipo de archivo no permitido')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        // Error genérico
        res.status(500).json({
            success: false,
            message: 'Error procesando archivos'
        });
    }
}

export default new ProposalController();
