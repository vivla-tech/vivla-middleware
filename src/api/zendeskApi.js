import axios from 'axios';
import { zendeskConfig } from '../config/zendesk.js';
import { homeStatsHelpers } from '../helpers/homeStatsHelpers.js';

// Función base para realizar peticiones a la API de Zendesk
export async function fetchZendeskData(endpoint, options = {}) {
    try {
        const response = await axios.get(
            `${zendeskConfig.url}${endpoint}`,
            { headers: zendeskConfig.headers, ...options }
        );
        return response.data;
    } catch (error) {
        console.error('Error al obtener datos de Zendesk:', error);
        throw error;
    }
}

// Obtener un ticket específico por ID
export async function getZendeskTicketById(ticketId) {
    const data = await fetchZendeskData(`/tickets/${ticketId}.json?include=users`);
    return data.ticket;
}

// Obtener lista de tickets con paginación
export async function getZendeskTickets(page = 1, per_page = 25, sort_by = 'created_at', sort_order = 'desc') {
    return fetchZendeskData(`/tickets.json?page=${page}&per_page=${per_page}&sort_by=${sort_by}&sort_order=${sort_order}&include=users`);
}

// Funciones para obtener estadísticas de tickets
export async function getZendeskUniqueHomes() {
    return homeStatsHelpers.getUniqueHomes();
}

export async function getZendeskTicketsForHome(homeName) {
    return homeStatsHelpers.getTicketsForHome(homeName);
} 