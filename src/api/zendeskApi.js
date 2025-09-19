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
export async function getZendeskTickets(page = 1, per_page = 25, sort_by = 'created_at', sort_order = 'desc', homeName = null, fromDate = null, status = null) {
    const HOME_FIELD_ID = 17925940459804;
    
    // Si hay filtro de fecha, necesitamos usar la API de búsqueda
    if (fromDate) {
        // Validar formato de fecha (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(fromDate)) {
            throw new Error('El formato de fecha debe ser YYYY-MM-DD');
        }
    }
    
    // Si hay cualquier filtro, usar la API de búsqueda
    if (homeName || fromDate || status) {
        let query = '';
        let queryParts = [];
        
        // Construir partes del query según los filtros disponibles
        if (homeName) {
            queryParts.push(`custom_field_${HOME_FIELD_ID}:${encodeURIComponent(homeName)}`);
        }
        
        if (fromDate) {
            queryParts.push(`created_at>=${fromDate}`);
        }
        
        if (status) {
            queryParts.push(`status:${status}`);
        }
        
        // Unir todas las partes con espacios
        query = queryParts.join(' ');
        
        const encodedQuery = encodeURIComponent(query);
        const endpoint = `/search.json?query=${encodedQuery}&page=${page}&per_page=${per_page}&sort_by=${sort_by}&sort_order=${sort_order}&include=users`;
        
        console.log('Tickets query:', query);
        console.log('Tickets encoded query:', encodedQuery);
        console.log('URL completa:', `${zendeskConfig.url}${endpoint}`);
        
        return fetchZendeskData(endpoint);
    } else {
        // Sin filtros, usar la API estándar de tickets
        return fetchZendeskData(`/tickets.json?page=${page}&per_page=${per_page}&sort_by=${sort_by}&sort_order=${sort_order}&include=users`);
    }
}

// Obtener tickets filtrados por custom_status usando la API de búsqueda
export async function getZendeskTicketsByCustomStatus(customStatusId, page = 1, per_page = 25, sort_by = 'created_at', sort_order = 'desc', homeName = null, fromDate = null) {
    const HOME_FIELD_ID = 17925940459804;
    
    let query = `custom_status_id:${customStatusId}`;
    
    // Si se proporciona un nombre de casa, agregar el filtro
    if (homeName) {
        query = `custom_field_${HOME_FIELD_ID}:${encodeURIComponent(homeName)} custom_status_id:${customStatusId}`;
    }
    
    // Si se proporciona una fecha from, agregar el filtro de created_at
    if (fromDate) {
        // Validar formato de fecha (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(fromDate)) {
            throw new Error('El formato de fecha debe ser YYYY-MM-DD');
        }
        
        // Añadir filtro de fecha al query
        query += ` created_at>=${fromDate}`;
    }
    
    const encodedQuery = encodeURIComponent(query);
    const endpoint = `/search.json?query=${encodedQuery}&page=${page}&per_page=${per_page}&sort_by=${sort_by}&sort_order=${sort_order}&include=users`;
    
    console.log('URL completa:', `${zendeskConfig.url}${endpoint}`);
    console.log('Query:', query);
    console.log('Query codificada:', encodedQuery);
    
    return fetchZendeskData(endpoint);
}

// Obtener tickets de reparaciones filtrados por custom field
export async function getZendeskRepairTickets(page = 1, per_page = 25, sort_by = 'created_at', sort_order = 'desc', homeName = null, fromDate = null) {
    const HOME_FIELD_ID = 17925940459804;
    const REPAIR_FIELD_ID = 17926767041308;
    
    let query = `custom_field_${REPAIR_FIELD_ID}:*`;
    
    // Si se proporciona un nombre de casa, agregar el filtro
    if (homeName) {
        query = `custom_field_${HOME_FIELD_ID}:${encodeURIComponent(homeName)} custom_field_${REPAIR_FIELD_ID}:*`;
    }
    
    // Si se proporciona una fecha from, agregar el filtro de created_at
    if (fromDate) {
        // Validar formato de fecha (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(fromDate)) {
            throw new Error('El formato de fecha debe ser YYYY-MM-DD');
        }
        
        // Añadir filtro de fecha al query
        query += ` created_at>=${fromDate}`;
    }
    
    const encodedQuery = encodeURIComponent(query);
    const endpoint = `/search.json?query=${encodedQuery}&page=${page}&per_page=${per_page}&sort_by=${sort_by}&sort_order=${sort_order}&include=users`;
    
    console.log('Repair tickets query:', query);
    console.log('Repair tickets encoded query:', encodedQuery);
    
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