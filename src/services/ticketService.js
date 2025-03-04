import axios from 'axios';
import { zendeskConfig } from '../config/zendesk.js';
import { homeStatsHelpers } from '../helpers/homeStatsHelpers.js';

export async function getTicketById(ticketId) {
    try {
        console.log(`Obteniendo ticket con ID: ${ticketId}`);

        const response = await axios.get(
            `${zendeskConfig.url}/tickets/${ticketId}.json?include=users`,
            { headers: zendeskConfig.headers }
        );

        return {
            status: 'success',
            data: homeStatsHelpers.formatTicket(response.data.ticket)
        };
    } catch (error) {
        console.error(`Error al obtener ticket:`, error);
        throw error;
    }
}

export async function getTickets(page = 1, per_page = 25, sort_by = 'created_at', sort_order = 'desc') {
    try {
        const response = await axios.get(
            `${zendeskConfig.url}/tickets.json?page=${page}&per_page=${per_page}&sort_by=${sort_by}&sort_order=${sort_order}&include=users`,
            { headers: zendeskConfig.headers }
        );

        // Cargar nombres de usuarios
        await homeStatsHelpers.loadUserNames(response.data.tickets);

        const formattedTickets = response.data.tickets.map(ticket =>
            homeStatsHelpers.formatTicket(ticket)
        );

        return {
            status: 'success',
            data: {
                tickets: formattedTickets,
                count: response.data.count,
                next_page: response.data.next_page,
                previous_page: response.data.previous_page
            }
        };
    } catch (error) {
        console.error('Error al obtener tickets:', error);
        throw error;
    }
}

export async function getTicketsStats() {
    try {
        // 1. Obtener lista única de casas
        const uniqueHomes = await homeStatsHelpers.getUniqueHomes();

        // 2. Estructura para almacenar estadísticas
        const homeStats = {};

        // 3. Procesar cada casa
        for (const homeName of uniqueHomes) {
            try {
                // Obtener tickets de esta casa
                const tickets = await homeStatsHelpers.getTicketsForHome(homeName);

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
        throw error;
    }
} 