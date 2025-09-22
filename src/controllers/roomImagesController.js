import { getRoomImagesData } from '../services/roomImagesService.js';

/**
 * Controlador para obtener imágenes de habitaciones de una casa específica
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function getRoomImagesController(req, res) {
    try {
        const { hid } = req.params;

        // Validar que se proporcione el hid
        if (!hid) {
            return res.status(400).json({
                status: 'error',
                message: 'El parámetro hid es requerido'
            });
        }

        console.log(`Obteniendo datos de casa con hid: ${hid}`);

        // Obtener datos de la casa desde Firestore
        const result = await getRoomImagesData(hid);

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
                message: 'Error al obtener datos de la casa',
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
        console.error('Error en getRoomImagesController:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor al obtener datos de la casa',
            error: error.message
        });
    }
}
