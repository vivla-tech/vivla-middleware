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

/**
 * Verifica si un error es el límite de respuesta de búsqueda de Zendesk
 * @param {Error} error - Error a verificar
 * @returns {boolean} true si es el error de límite de búsqueda
 */
function isSearchLimitError(error) {
    if (!error.response || error.response.status !== 422) {
        return false;
    }
    
    const errorData = error.response.data;
    if (errorData && errorData.description) {
        return errorData.description.includes('Search Response Limits') ||
               errorData.description.includes('response size was greater');
    }
    
    return false;
}

/**
 * Calcula la diferencia en días entre dos fechas
 * @param {string|null} fromDate - Fecha inicio (YYYY-MM-DD) o null
 * @param {string|null} toDate - Fecha fin (YYYY-MM-DD) o null
 * @returns {number|null} Diferencia en días, o null si alguna fecha es null
 */
function getDaysBetween(fromDate, toDate) {
    if (!fromDate || !toDate) {
        return null;
    }
    const from = new Date(fromDate);
    const to = new Date(toDate);
    return Math.ceil((to - from) / (1000 * 60 * 60 * 24));
}

/**
 * Divide un rango de fechas en sub-rangos más pequeños
 * @param {string} fromDate - Fecha inicio (YYYY-MM-DD)
 * @param {string} toDate - Fecha fin (YYYY-MM-DD)
 * @param {number} maxDays - Máximo de días por sub-rango (default: 180 días ~ 6 meses)
 * @returns {Array} Array de objetos {fromDate, toDate}
 */
function splitDateRange(fromDate, toDate, maxDays = 180) {
    const ranges = [];
    let currentFrom = new Date(fromDate);
    const finalTo = new Date(toDate);
    
    while (currentFrom <= finalTo) {
        const currentTo = new Date(currentFrom);
        currentTo.setDate(currentTo.getDate() + maxDays - 1); // -1 porque incluye el día inicial
        
        // No exceder la fecha final
        if (currentTo > finalTo) {
            currentTo.setTime(finalTo.getTime());
        }
        
        ranges.push({
            fromDate: currentFrom.toISOString().split('T')[0],
            toDate: currentTo.toISOString().split('T')[0]
        });
        
        // Mover al siguiente rango
        currentFrom = new Date(currentTo);
        currentFrom.setDate(currentFrom.getDate() + 1);
    }
    
    return ranges;
}

/**
 * Obtiene tickets de un rango específico con paginación automática
 * @param {string} homeName - Nombre de la casa (opcional)
 * @param {string} fromDate - Fecha inicio (YYYY-MM-DD)
 * @param {string} toDate - Fecha fin (YYYY-MM-DD)
 * @returns {Promise<Array>} Array de tickets
 */
async function getTicketsForDateRange(homeName, fromDate, toDate) {
    const HOME_FIELD_ID = 17925940459804;
    const per_page = 100;
    const MAX_RETRIES = 2; // Máximo de reintentos con división de rango
    
    let allTickets = [];
    let page = 1;
    let hasMorePages = true;
    
    while (hasMorePages) {
        try {
            let queryParts = [];
            
            if (homeName) {
                queryParts.push(`custom_field_${HOME_FIELD_ID}:${encodeURIComponent(homeName)}`);
            }
            
            if (fromDate) {
                queryParts.push(`created_at>=${fromDate}`);
            }
            
            if (toDate) {
                queryParts.push(`created_at<=${toDate}`);
            }
            
            const query = queryParts.join(' ');
            const encodedQuery = encodeURIComponent(query);
            const endpoint = `/search.json?query=${encodedQuery}&page=${page}&per_page=${per_page}&include=users`;
            
            console.log(`  Página ${page}: Query = "${query}"`);
            const response = await fetchZendeskData(endpoint);
            
            // En la API de búsqueda, los tickets están en 'results'
            if (response.results && response.results.length > 0) {
                allTickets = allTickets.concat(response.results);
                console.log(`  Página ${page}: ${response.results.length} tickets obtenidos. Total acumulado: ${allTickets.length}`);
                
                // Verificar si hay más páginas
                hasMorePages = response.results.length === per_page;
                page++;
            } else {
                hasMorePages = false;
            }
            
            // Seguridad: evitar bucles infinitos
            if (page > 100) {
                console.warn(`  ⚠️ Se alcanzó el límite de 100 páginas (10,000 tickets). Deteniendo la consulta para este rango.`);
                break;
            }
        } catch (error) {
            // Si es el error de límite de búsqueda y aún podemos dividir más
            const daysDiff = getDaysBetween(fromDate, toDate);
            if (isSearchLimitError(error) && daysDiff !== null && daysDiff > 30) {
                console.warn(`  ⚠️ Límite de búsqueda alcanzado en página ${page} para rango ${fromDate || 'sin inicio'} - ${toDate || 'sin fin'}.`);
                console.warn(`  ✅ Tickets obtenidos hasta ahora: ${allTickets.length}. Dividiendo rango para continuar...`);
                
                // Guardar los tickets obtenidos hasta ahora
                const ticketsObtained = [...allTickets];
                
                // Dividir el rango en mitades y obtener cada parte recursivamente
                const halfDays = Math.floor(daysDiff / 2);
                
                const midDate = new Date(fromDate);
                midDate.setDate(midDate.getDate() + halfDays);
                const midDateStr = midDate.toISOString().split('T')[0];
                
                console.log(`  Dividiendo en dos sub-rangos: ${fromDate} - ${midDateStr} y ${midDateStr} - ${toDate}`);
                
                // Obtener primera mitad (si no hemos obtenido ya todos los tickets del rango)
                // Si ya tenemos tickets, probablemente los del primer rango ya están incluidos
                // pero necesitamos obtener los del segundo rango
                let remainingTickets = [];
                
                // Si ya tenemos tickets, intentar obtener solo los del segundo rango
                // (para evitar duplicados)
                if (ticketsObtained.length > 0) {
                    // Obtener segunda mitad
                    remainingTickets = await getTicketsForDateRange(homeName, midDateStr, toDate);
                    // Combinar con los tickets ya obtenidos
                    return [...ticketsObtained, ...remainingTickets];
                } else {
                    // Si no hay tickets obtenidos, dividir normalmente
                    const firstHalf = await getTicketsForDateRange(homeName, fromDate, midDateStr);
                    const secondHalf = await getTicketsForDateRange(homeName, midDateStr, toDate);
                    return [...firstHalf, ...secondHalf];
                }
            } else {
                // Si no es el error de límite o el rango ya es muy pequeño, lanzar el error
                console.error(`  ❌ Error en página ${page}:`, error.response?.data?.description || error.message);
                throw error;
            }
        }
    }
    
    return allTickets;
}

// Obtener todos los tickets para estadísticas (manejando paginación automáticamente y límites de Zendesk)
export async function getAllZendeskTicketsForStats(homeName = null, fromDate = null, toDate = null) {
    const HOME_FIELD_ID = 17925940459804;
    
    // Validar formato de fecha si se proporciona
    if (fromDate) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(fromDate)) {
            throw new Error('El formato de fecha debe ser YYYY-MM-DD');
        }
    }
    
    if (toDate) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(toDate)) {
            throw new Error('El formato de fecha debe ser YYYY-MM-DD');
        }
    }
    
    console.log('Obteniendo todos los tickets para estadísticas...');
    
    // Si no hay filtros de fecha, usar la API estándar
    if (!fromDate && !toDate && !homeName) {
        let allTickets = [];
        let page = 1;
        let hasMorePages = true;
        const per_page = 100;
        
        while (hasMorePages) {
            const endpoint = `/tickets.json?page=${page}&per_page=${per_page}&include=users`;
            console.log(`Página ${page}: Sin filtros, usando API estándar`);
            const response = await fetchZendeskData(endpoint);
            
            if (response.tickets && response.tickets.length > 0) {
                allTickets = allTickets.concat(response.tickets);
                console.log(`Página ${page}: ${response.tickets.length} tickets obtenidos. Total acumulado: ${allTickets.length}`);
                
                hasMorePages = response.tickets.length === per_page;
                page++;
            } else {
                hasMorePages = false;
            }
            
            if (page > 1000) {
                console.warn('Se alcanzó el límite de 1000 páginas. Deteniendo la consulta.');
                break;
            }
        }
        
        console.log(`Consulta completada. Total de tickets obtenidos: ${allTickets.length}`);
        return {
            tickets: allTickets,
            count: allTickets.length
        };
    }
    
    // Si hay filtros de fecha, usar estrategia de división de rangos
    let allTickets = [];
    
    if (fromDate && toDate) {
        // Calcular días entre fechas
        const daysDiff = getDaysBetween(fromDate, toDate);
        console.log(`📅 Rango de fechas: ${fromDate} a ${toDate} (${daysDiff} días)`);
        
        // Si el rango es mayor a 3 meses (90 días), dividirlo automáticamente para evitar límites
        // Reducimos el umbral a 90 días para ser más conservadores y evitar el error 422
        if (daysDiff > 90) {
            console.log(`🔀 Rango de fechas grande (${daysDiff} días). Dividiendo automáticamente en sub-rangos de 90 días...`);
            const dateRanges = splitDateRange(fromDate, toDate, 90);
            console.log(`📊 Dividido en ${dateRanges.length} sub-rangos`);
            
            for (let i = 0; i < dateRanges.length; i++) {
                const range = dateRanges[i];
                console.log(`\n🔄 Procesando sub-rango ${i + 1}/${dateRanges.length}: ${range.fromDate} - ${range.toDate}`);
                
                const tickets = await getTicketsForDateRange(homeName, range.fromDate, range.toDate);
                allTickets = allTickets.concat(tickets);
                
                console.log(`✅ Sub-rango ${i + 1} completado: ${tickets.length} tickets. Total acumulado: ${allTickets.length}`);
            }
        } else {
            // Rango pequeño, obtener directamente
            console.log(`📥 Rango pequeño (${daysDiff} días). Obteniendo tickets directamente...`);
            allTickets = await getTicketsForDateRange(homeName, fromDate, toDate);
        }
    } else if (fromDate) {
        // Solo fecha inicio, usar estrategia de paginación normal con manejo de errores
        allTickets = await getTicketsForDateRange(homeName, fromDate, null);
    } else if (toDate) {
        // Solo fecha fin, usar estrategia de paginación normal con manejo de errores
        allTickets = await getTicketsForDateRange(homeName, null, toDate);
    } else if (homeName) {
        // Solo filtro de casa, usar estrategia de paginación normal con manejo de errores
        allTickets = await getTicketsForDateRange(homeName, null, null);
    }
    
    console.log(`Consulta completada. Total de tickets obtenidos: ${allTickets.length}`);
    
    return {
        tickets: allTickets,
        count: allTickets.length
    };
}

// Funciones para obtener estadísticas de tickets
export async function getZendeskUniqueHomes() {
    return homeStatsHelpers.getUniqueHomes();
}

export async function getZendeskTicketsForHome(homeName) {
    return homeStatsHelpers.getTicketsForHome(homeName);
}

// Obtener lista de usuarios de Zendesk
export async function getZendeskUsers(page = 1, per_page = 100, role = 'end-user') {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            per_page: per_page.toString(),
            role: role
        });
        
        const endpoint = `/users.json?${params.toString()}`;
        return fetchZendeskData(endpoint);
    } catch (error) {
        console.error('Error al obtener usuarios de Zendesk:', error);
        throw error;
    }
}

// Obtener tickets solicitados por un usuario específico
export async function getZendeskUserRequestedTickets(userId, page = 1, per_page = 25) {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            per_page: per_page.toString()
        });
        
        const endpoint = `/users/${userId}/tickets/requested.json?${params.toString()}`;
        return fetchZendeskData(endpoint);
    } catch (error) {
        console.error(`Error al obtener tickets solicitados por el usuario ${userId}:`, error);
        throw error;
    }
} 