import { getZendeskTicketById, getZendeskTickets, getZendeskUniqueHomes, getZendeskTicketsForHome } from '../api/zendeskApi.js';
import { homeStatsHelpers } from '../helpers/homeStatsHelpers.js';

export async function getTicketById(ticketId) {
    try {
        console.log(`Obteniendo ticket con ID: ${ticketId}`);

        const ticket = await getZendeskTicketById(ticketId);

        if (!ticket) {
            return {
                status: 'error',
                message: `No se encontró el ticket con ID: ${ticketId}`
            };
        }

        return {
            status: 'success',
            data: homeStatsHelpers.formatTicket(ticket)
        };
    } catch (error) {
        console.error(`Error al obtener ticket:`, error);
        return {
            status: 'error',
            message: 'Error al obtener el ticket',
            error: error.message
        };
    }
}

export async function getTickets(page = 1, per_page = 25, sort_by = 'created_at', sort_order = 'desc') {
    try {
        const response = await getZendeskTickets(page, per_page, sort_by, sort_order);

        // Cargar nombres de usuarios
        await homeStatsHelpers.loadUserNames(response.tickets);

        const formattedTickets = response.tickets.map(ticket =>
            homeStatsHelpers.formatTicket(ticket)
        );

        return {
            status: 'success',
            data: {
                tickets: formattedTickets,
                count: response.count,
                next_page: response.next_page,
                previous_page: response.previous_page
            }
        };
    } catch (error) {
        console.error('Error al obtener tickets:', error);
        return {
            status: 'error',
            message: 'Error al obtener tickets',
            error: error.message
        };
    }
}

export async function getTicketsStats() {
    try {
        // 1. Obtener lista única de casas
        const uniqueHomes = await getZendeskUniqueHomes();

        // 2. Estructura para almacenar estadísticas
        const homeStats = {};

        // 3. Procesar cada casa
        for (const homeName of uniqueHomes) {
            try {
                // Obtener tickets de esta casa
                const tickets = await getZendeskTicketsForHome(homeName);

                // Inicializar estadísticas para esta casa
                homeStats[homeName] = homeStatsHelpers.initializeHomeStats(homeName);

                // Procesar tickets de esta casa
                tickets.forEach(ticket => {
                    homeStatsHelpers.processTicket(ticket, homeStats);
                });
            } catch (error) {
                console.error(`Error procesando casa ${homeName}:`, error);
                continue;
            }
        }

        // 4. Procesar los tickets recientes para cada home
        homeStatsHelpers.processRecentTickets(homeStats);

        // 5. Convertir a array y retornar
        return {
            status: 'success',
            data: {
                homes: Object.values(homeStats)
            }
        };
    } catch (error) {
        console.error('Error al obtener estadísticas de homes:', error);
        return {
            status: 'error',
            message: 'Error al obtener estadísticas de homes',
            error: error.message
        };
    }
} 