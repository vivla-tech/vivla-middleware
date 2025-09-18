import { getInspectionDates } from '../services/inspectionService.js';

/**
 * Controlador para obtener fechas de inspección de una casa específica
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function getInspectionDatesController(req, res) {
    try {
        const { hid } = req.params;

        // Validar que se proporcione el hid
        if (!hid) {
            return res.status(400).json({
                status: 'error',
                message: 'El parámetro hid es requerido'
            });
        }

        console.log(`Obteniendo fechas de inspección para casa con hid: ${hid}`);

        // Obtener fechas de inspección del servicio
        const result = await getInspectionDates(hid);

        if (result.status === 'error') {
            // Si es error de casa no encontrada, devolver 404
            if (result.message.includes('No se encontró la casa')) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Casa no encontrada',
                    error: result.message
                });
            }

            // Si es error de tipo no válido, devolver 400
            if (result.message.includes('Tipo de casa no válido')) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Tipo de casa no válido',
                    error: result.message
                });
            }

            // Para otros errores, devolver 500
            return res.status(500).json({
                status: 'error',
                message: 'Error al obtener fechas de inspección',
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
        console.error('Error en getInspectionDatesController:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor al obtener fechas de inspección',
            error: error.message
        });
    }
}
