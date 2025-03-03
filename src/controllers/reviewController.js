import { getAllReviews, getFilteredReviews } from '../services/reviewService.js';

export async function getReviews(req, res) {
    try {
        const { type, houseId } = req.query;
        const filters = {};

        // Validar el tipo de review
        if (type) {
            if (!['home', 'stay'].includes(type)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'El tipo de review debe ser "home" o "stay"'
                });
            }
            filters.type = type;
        }

        // Validar el ID de la casa
        if (houseId) {
            if (!/^\d+$/.test(houseId)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'El ID de la casa debe ser un número'
                });
            }
            filters.houseId = houseId;
        }

        const result = Object.keys(filters).length > 0
            ? await getFilteredReviews(filters)
            : await getAllReviews();

        res.json(result);
    } catch (error) {
        console.error('Error en el controlador de reviews:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error al obtener las reviews'
        });
    }
} 