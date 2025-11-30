import { homeStaysStats } from '../services/staysService.js';

/**
 * Controlador para obtener estadísticas de estancias de una casa específica
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function getHomeStaysStatsController(req, res) {
    try {
        const { hid } = req.params;
        const { from } = req.query;

        // Validar que se proporcione el hid
        if (!hid) {
            return res.status(400).json({
                status: 'error',
                message: 'El parámetro hid es requerido'
            });
        }

        // Validar formato de fecha si se proporciona
        if (from) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(from)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'El parámetro from debe tener el formato YYYY-MM-DD (ejemplo: 2024-11-30)'
                });
            }
            
            // Validar que sea una fecha válida
            const dateObj = new Date(from + 'T00:00:00.000Z');
            if (isNaN(dateObj.getTime())) {
                return res.status(400).json({
                    status: 'error',
                    message: 'El parámetro from no es una fecha válida'
                });
            }
        }

        console.log(`Obteniendo estadísticas de estancias para casa con hid: ${hid}${from ? ` (desde ${from})` : ''}`);

        // Obtener estadísticas del servicio
        const result = await homeStaysStats(hid, from || null);

        if (result.status === 'error') {
            // Si es error de casa no encontrada, devolver 404
            if (result.message.includes('No se encontró la casa')) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Casa no encontrada',
                    error: result.message
                });
            }

            // Para otros errores, devolver 500
            return res.status(500).json({
                status: 'error',
                message: 'Error al obtener estadísticas de estancias',
                error: result.message
            });
        }

        // Respuesta exitosa
        return res.status(200).json({
            status: 'success',
            message: result.message,
            data: result.data
        });

    } catch (error) {
        console.error('Error en getHomeStaysStatsController:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor al obtener estadísticas de estancias',
            error: error.message
        });
    }
}
