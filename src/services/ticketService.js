import axios from 'axios';
import { zendeskConfig } from '../config/zendesk.js';
import { homeStatsHelpers } from '../helpers/homeStatsHelpers.js';

export async function getTicketById(ticketId) {
    try {
        console.log(`Obteniendo ticket con ID: ${ticketId}`);

        const response = await axios.get(
            `${zendeskConfig.url}/tickets/${ticketId}.json`,
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
            `${zendeskConfig.url}/tickets.json?page=${page}&per_page=${per_page}&sort_by=${sort_by}&sort_order=${sort_order}`,
            { headers: zendeskConfig.headers }
        );

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