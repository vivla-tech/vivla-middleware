import { getTicketById as getTicketByIdService, getTickets as getTicketsService, getTicketsStats as getTicketsStatsService } from '../services/ticketService.js';

export async function getTicketById(req, res) {
    try {
        const ticketId = req.params.id;
        const result = await getTicketByIdService(ticketId);
        return res.json(result);
    } catch (error) {
        console.error(`Error al obtener ticket:`, error);
        return res.status(error.response?.status || 500).json({
            status: 'error',
            message: 'Error al obtener el ticket',
            error: error.message
        });
    }
}

export async function getTickets(req, res) {
    try {
        const { page = 1, per_page = 25, sort_by = 'created_at', sort_order = 'desc' } = req.query;
        const result = await getTicketsService(page, per_page, sort_by, sort_order);

        // Obtener el protocolo y host del request
        const protocol = req.protocol;
        const host = req.get('host');

        // Construir URLs completas para la paginación
        const nextPage = result.data.next_page
            ? `${protocol}://${host}/api/tickets?page=${parseInt(page) + 1}&per_page=${per_page}&sort_by=${sort_by}&sort_order=${sort_order}`
            : null;

        const previousPage = result.data.previous_page
            ? `${protocol}://${host}/api/tickets?page=${parseInt(page) - 1}&per_page=${per_page}&sort_by=${sort_by}&sort_order=${sort_order}`
            : null;

        result.data.next_page = nextPage;
        result.data.previous_page = previousPage;

        return res.json(result);
    } catch (error) {
        console.error('Error al obtener tickets:', error);
        return res.status(error.response?.status || 500).json({
            status: 'error',
            message: 'Error al obtener tickets',
            error: error.message
        });
    }
}

export async function getTicketsStats(req, res) {
    try {
        const result = await getTicketsStatsService();
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