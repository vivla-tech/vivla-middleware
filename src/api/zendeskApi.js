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

// Obtener tickets filtrados por custom_status usando la API de búsqueda
export async function getZendeskTicketsByCustomStatus(customStatusId, page = 1, per_page = 25, sort_by = 'created_at', sort_order = 'desc') {
    const query = `custom_status_id:${customStatusId}`;
    const encodedQuery = encodeURIComponent(query);
    const endpoint = `/search.json?query=${encodedQuery}&page=${page}&per_page=${per_page}&sort_by=${sort_by}&sort_order=${sort_order}&include=users`;
    
    console.log('URL completa:', `${zendeskConfig.url}${endpoint}`);
    console.log('Query:', query);
    console.log('Query codificada:', encodedQuery);
    
    return fetchZendeskData(endpoint);
}

// Obtener tickets de reparaciones filtrados por custom field
export async function getZendeskRepairTickets(page = 1, per_page = 25, sort_by = 'created_at', sort_order = 'desc') {
    const REPAIR_FIELD_ID = 17926767041308;
    const query = `custom_field_${REPAIR_FIELD_ID}:*`;
    const encodedQuery = encodeURIComponent(query);
    const endpoint = `/search.json?query=${encodedQuery}&page=${page}&per_page=${per_page}&sort_by=${sort_by}&sort_order=${sort_order}&include=users`;
    
    return fetchZendeskData(endpoint);
}

// Obtener tickets de reparaciones para una casa específica (sin paginación, para estadísticas)
export async function getZendeskHomeRepairTickets(homeName) {
    const HOME_FIELD_ID = 17925940459804;
    const REPAIR_FIELD_ID = 17926767041308;
    const query = `custom_field_${HOME_FIELD_ID}:${encodeURIComponent(homeName)} custom_field_${REPAIR_FIELD_ID}:*`;
    const encodedQuery = encodeURIComponent(query);
    const endpoint = `/search.json?query=${encodedQuery}&include=users`;
    
    return fetchZendeskData(endpoint);
}

// Funciones para obtener estadísticas de tickets
export async function getZendeskUniqueHomes() {
    return homeStatsHelpers.getUniqueHomes();
}

export async function getZendeskTicketsForHome(homeName) {
    return homeStatsHelpers.getTicketsForHome(homeName);
} 