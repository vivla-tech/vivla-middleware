import { getTicketById, getTickets, getImprovementProposalTickets, getRepairTickets, getHomeRepairStats, getTicketsStats, getTicketsSimpleStats } from '../services/ticketService.js';

export async function getTicketByIdController(req, res) {
    try {
        const ticketId = req.params.id;

        if (!ticketId) {
            return res.status(400).json({
                status: 'error',
                message: 'Se requiere el ID del ticket'
            });
        }

        const result = await getTicketById(ticketId);

        if (result.status === 'error') {
            // Si no se encontró el ticket, devolver 404
            if (result.message.includes('No se encontró')) {
                return res.status(404).json(result);
            }
            // Otros errores son 500
            return res.status(500).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error(`Error en el controlador de tickets:`, error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor',
            error: error.message
        });
    }
}

export async function getTicketsController(req, res) {
    try {
        const { page = 1, per_page = 25, sort_by = 'created_at', sort_order = 'desc', home, from, status } = req.query;
        const result = await getTickets(page, per_page, sort_by, sort_order, home, from, status);

        if (result.status === 'error') {
            return res.status(500).json(result);
        }

        // Obtener el protocolo y host del request
        const protocol = req.protocol;
        const host = req.get('host');

        // Construir URLs completas para la paginación (incluyendo filtros si existen)
        const homeParam = home ? `&home=${encodeURIComponent(home)}` : '';
        const fromParam = from ? `&from=${encodeURIComponent(from)}` : '';
        const statusParam = status ? `&status=${encodeURIComponent(status)}` : '';
        const queryParams = `${homeParam}${fromParam}${statusParam}`;
        
        if (result.data.next_page) {
            result.data.next_page = `${protocol}://${host}/v1/tickets?page=${parseInt(page) + 1}&per_page=${per_page}&sort_by=${sort_by}&sort_order=${sort_order}${queryParams}`;
        }

        if (result.data.previous_page) {
            result.data.previous_page = `${protocol}://${host}/v1/tickets?page=${parseInt(page) - 1}&per_page=${per_page}&sort_by=${sort_by}&sort_order=${sort_order}${queryParams}`;
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error en el controlador de tickets:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor',
            error: error.message
        });
    }
}

export async function getImprovementProposalTicketsController(req, res) {
    try {
        const { page = 1, per_page = 25, sort_by = 'created_at', sort_order = 'desc', home, from } = req.query;
        const result = await getImprovementProposalTickets(page, per_page, sort_by, sort_order, home, from);

        if (result.status === 'error') {
            return res.status(500).json(result);
        }

        // Obtener el protocolo y host del request
        const protocol = req.protocol;
        const host = req.get('host');

        // Construir URLs completas para la paginación (incluyendo filtros si existen)
        const homeParam = home ? `&home=${encodeURIComponent(home)}` : '';
        const fromParam = from ? `&from=${encodeURIComponent(from)}` : '';
        const queryParams = `${homeParam}${fromParam}`;
        
        if (result.data.next_page) {
            result.data.next_page = `${protocol}://${host}/v1/tickets/improvement-proposals?page=${parseInt(page) + 1}&per_page=${per_page}&sort_by=${sort_by}&sort_order=${sort_order}${queryParams}`;
        }

        if (result.data.previous_page) {
            result.data.previous_page = `${protocol}://${host}/v1/tickets/improvement-proposals?page=${parseInt(page) - 1}&per_page=${per_page}&sort_by=${sort_by}&sort_order=${sort_order}${queryParams}`;
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error en el controlador de tickets de propuesta de mejora:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor',
            error: error.message
        });
    }
}

export async function getRepairTicketsController(req, res) {
    try {
        const { page = 1, per_page = 25, sort_by = 'created_at', sort_order = 'desc', home, from } = req.query;
        const result = await getRepairTickets(page, per_page, sort_by, sort_order, home, from);

        if (result.status === 'error') {
            return res.status(500).json(result);
        }

        // Obtener el protocolo y host del request
        const protocol = req.protocol;
        const host = req.get('host');

        // Construir URLs completas para la paginación (incluyendo filtros si existen)
        const homeParam = home ? `&home=${encodeURIComponent(home)}` : '';
        const fromParam = from ? `&from=${encodeURIComponent(from)}` : '';
        const queryParams = `${homeParam}${fromParam}`;
        
        if (result.data.next_page) {
            result.data.next_page = `${protocol}://${host}/v1/tickets/repairs?page=${parseInt(page) + 1}&per_page=${per_page}&sort_by=${sort_by}&sort_order=${sort_order}${queryParams}`;
        }

        if (result.data.previous_page) {
            result.data.previous_page = `${protocol}://${host}/v1/tickets/repairs?page=${parseInt(page) - 1}&per_page=${per_page}&sort_by=${sort_by}&sort_order=${sort_order}${queryParams}`;
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error en el controlador de tickets de reparaciones:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor',
            error: error.message
        });
    }
}

export async function getHomeRepairStatsController(req, res) {
    try {
        const { homeName } = req.params;

        if (!homeName) {
            return res.status(400).json({
                status: 'error',
                message: 'Se requiere el nombre de la casa'
            });
        }

        const result = await getHomeRepairStats(homeName);

        if (result.status === 'error') {
            return res.status(500).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error en el controlador de estadísticas de reparaciones por casa:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor',
            error: error.message
        });
    }
}

export async function getTicketsStatsController(req, res) {
    try {
        const result = await getTicketsStats();

        if (result.status === 'error') {
            return res.status(500).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error en el controlador de estadísticas de tickets:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor',
            error: error.message
        });
    }
}

export async function getTicketsSimpleStatsController(req, res) {
    try {
        const { home, from } = req.query;
        const result = await getTicketsSimpleStats(home, from);

        if (result.status === 'error') {
            return res.status(500).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error en el controlador de estadísticas simples de tickets:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor al obtener estadísticas simples',
            error: error.message
        });
    }
} 