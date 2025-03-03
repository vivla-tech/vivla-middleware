import { getAllReviews as getAllReviewsService } from '../services/reviewService.js';

export async function getAllReviews(req, res) {
    try {
        const result = await getAllReviewsService();
        return res.json(result);
    } catch (error) {
        console.error('Error al obtener todas las reviews:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error al obtener todas las reviews',
            error: error.message
        });
    }
} 