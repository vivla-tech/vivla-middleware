import { getAllReviews, getFilteredReviews } from '../services/firebase/reviewService.js';
import { getHouseIdByName } from '../services/firebase/houseService.js';

export async function getReviews(req, res) {
    try {
        const { type, houseName } = req.query;
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

        // Validar y obtener el ID de la casa por nombre
        if (houseName) {
            try {
                const houseId = await getHouseIdByName(houseName);
                filters.houseId = houseId;
            } catch (error) {
                return res.status(400).json({
                    status: 'error',
                    message: error.message
                });
            }
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