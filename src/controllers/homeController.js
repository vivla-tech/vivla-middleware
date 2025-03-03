import { getHomeStats as getHomeStatsService } from '../services/homeService.js';

export async function getHomeStats(req, res) {
    try {
        const result = await getHomeStatsService();
        return res.json(result);
    } catch (error) {
        console.error('Error al obtener estadísticas de homes:', error);
        return res.status(error.response?.status || 500).json({
            status: 'error',
            message: 'Error al obtener estadísticas',
            error: error.message
        });
    }
} 