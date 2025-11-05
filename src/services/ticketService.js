import { getZendeskTicketById, getZendeskTickets, getZendeskTicketsByCustomStatus, getZendeskRepairTickets, getZendeskHomeRepairTickets, getZendeskUniqueHomes, getZendeskTicketsForHome, getAllZendeskTicketsForStats } from '../api/zendeskApi.js';
import { homeStatsHelpers } from '../helpers/homeStatsHelpers.js';

/**
 * Función helper para logging de debug
 * @param {string} message - Mensaje a loguear
 */
function debugLog(message) {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true') {
        console.log(message);
    }
}

/**
 * Determina si un ticket debe ser descartado (no procesado) basado en su custom_status
 * @param {Object} ticket - Datos del ticket
 * @returns {boolean} true si el ticket debe ser descartado, false si debe procesarse
 */
function shouldDiscardTicket(ticket) {
    // Validar entrada
    if (!ticket || typeof ticket !== 'object') {
        debugLog('⚠️ Ticket inválido recibido en shouldDiscardTicket');
        return true; // Descartar tickets inválidos
    }

    // Custom statuses prohibidos (tickets que no deben migrarse)
    const forbiddenCustomStatuses = [
        18587461153436 // Ticket de propuesta de mejora
    ];

    if (ticket.custom_status_id && forbiddenCustomStatuses.includes(ticket.custom_status_id)) {
        debugLog(`🚫 Ticket ${ticket.id} descartado por custom_status: ${ticket.custom_status_id}`);
        return true;
    }
    

    return false;
}

/**
 * Calcula la fecha de la última actuación (ticket más reciente con estados finalizados ≤ currentDate)
 * @param {Array} tickets - Array de tickets de Zendesk
 * @param {string} currentDate - Fecha actual en formato YYYY-MM-DD
 * @param {number} repairFieldId - ID del custom field de reparaciones
 * @returns {Object} Objeto con la fecha de última actuación
 */
function calculateLastAction(tickets, currentDate, repairFieldId) {
    const currentDateObj = new Date(currentDate);
    const targetStates = ['finalizado', 'comunicado_a_propietario'];
    
    // Filtrar tickets con estados objetivo
    const completedTickets = [];
    
    tickets.forEach(ticket => {
        const repairField = ticket.custom_fields.find(field => field.id === repairFieldId);
        
        if (repairField && repairField.value && targetStates.includes(repairField.value)) {
            // Convertir updated_at a formato YYYY-MM-DD
            const updatedAt = new Date(ticket.updated_at);
            const updatedAtStr = updatedAt.toISOString().split('T')[0];
            
            // Solo incluir tickets donde updated_at <= currentDate
            if (updatedAt <= currentDateObj) {
                completedTickets.push({
                    updatedAt: updatedAtStr,
                    updatedAtObj: updatedAt,
                    state: repairField.value
                });
            }
        }
    });
    
    if (completedTickets.length === 0) {
        return {
            date: null,
            message: 'No disponible'
        };
    }
    
    // Encontrar el ticket más reciente
    const lastAction = completedTickets.reduce((latest, current) => {
        return current.updatedAtObj > latest.updatedAtObj ? current : latest;
    });
    
    return {
        date: lastAction.updatedAt,
        message: `Last action: ${lastAction.state} on ${lastAction.updatedAt}`
    };
}

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

        // Precargar datos necesarios
        await Promise.all([
            homeStatsHelpers.loadUserNames([ticket]),
            homeStatsHelpers.loadGroupNames([ticket]),
            homeStatsHelpers.preloadCustomFieldsOptions()
        ]);

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

export async function getTickets(page = 1, per_page = 25, sort_by = 'created_at', sort_order = 'desc', homeName = null, fromDate = null, status = null) {
    try {
        const response = await getZendeskTickets(page, per_page, sort_by, sort_order, homeName, fromDate, status);

        // Precargar todos los datos necesarios en paralelo
        await Promise.all([
            homeStatsHelpers.loadUserNames(response.tickets || response.results),
            homeStatsHelpers.loadGroupNames(response.tickets || response.results),
            homeStatsHelpers.preloadCustomFieldsOptions()
        ]);

        // Formatear todos los tickets (ahora es súper rápido)
        const tickets = response.tickets || response.results;
        const formattedTickets = tickets.map(ticket =>
            homeStatsHelpers.formatTicket(ticket)
        );

        return {
            status: 'success',
            data: {
                tickets: formattedTickets,
                count: response.count,
                next_page: response.next_page,
                previous_page: response.previous_page,
                home_filter: homeName || null
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

export async function getImprovementProposalTickets(page = 1, per_page = 25, sort_by = 'created_at', sort_order = 'desc', homeName = null, fromDate = null) {
    try {
        const CUSTOM_STATUS_ID = 18587461153436;
        const response = await getZendeskTicketsByCustomStatus(CUSTOM_STATUS_ID, page, per_page, sort_by, sort_order, homeName, fromDate);

        // Precargar todos los datos necesarios en paralelo
        await Promise.all([
            homeStatsHelpers.loadUserNames(response.results),
            homeStatsHelpers.loadGroupNames(response.results),
            homeStatsHelpers.preloadCustomFieldsOptions()
        ]);

        // Formatear todos los tickets (ahora es súper rápido)
        const formattedTickets = response.results.map(ticket =>
            homeStatsHelpers.formatTicket(ticket)
        );

        return {
            status: 'success',
            data: {
                tickets: formattedTickets,
                count: response.count,
                next_page: response.next_page,
                previous_page: response.previous_page,
                home_filter: homeName || null
            }
        };
    } catch (error) {
        console.error('Error al obtener tickets de propuesta de mejora:', error);
        return {
            status: 'error',
            message: 'Error al obtener tickets de propuesta de mejora',
            error: error.message
        };
    }
}

export async function getRepairTickets(page = 1, per_page = 25, sort_by = 'created_at', sort_order = 'desc', homeName = null, fromDate = null) {
    try {
        const response = await getZendeskRepairTickets(page, per_page, sort_by, sort_order, homeName, fromDate);

        // Precargar todos los datos necesarios en paralelo
        await Promise.all([
            homeStatsHelpers.loadUserNames(response.results),
            homeStatsHelpers.loadGroupNames(response.results),
            homeStatsHelpers.preloadCustomFieldsOptions()
        ]);

        // Formatear todos los tickets (ahora es súper rápido)
        const formattedTickets = response.results.map(ticket =>
            homeStatsHelpers.formatTicket(ticket)
        );

        return {
            status: 'success',
            data: {
                tickets: formattedTickets,
                count: response.count,
                next_page: response.next_page,
                previous_page: response.previous_page,
                home_filter: homeName || null
            }
        };
    } catch (error) {
        console.error('Error al obtener tickets de reparaciones:', error);
        return {
            status: 'error',
            message: 'Error al obtener tickets de reparaciones',
            error: error.message
        };
    }
}

export async function getHomeRepairStats(homeName) {
    try {
        const response = await getZendeskHomeRepairTickets(homeName);
        
        // Precargar datos necesarios para obtener nombres de campos personalizados
        await homeStatsHelpers.preloadCustomFieldsOptions();
        
        const REPAIR_FIELD_ID = 17926767041308;
        const stats = {};
        
        // Contar tickets por cada tipo de custom field de reparaciones
        response.results.forEach(ticket => {
            const repairField = ticket.custom_fields.find(field => field.id === REPAIR_FIELD_ID);
            if (repairField && repairField.value) {
                const repairType = repairField.value;
                stats[repairType] = (stats[repairType] || 0) + 1;
            }
        });

        // Calcular la última actuación (ticket más reciente con estados finalizados ≤ currentDate)
        const currentDate = new Date().toISOString().split('T')[0];
        const lastAction = calculateLastAction(response.results, currentDate, REPAIR_FIELD_ID);

        return {
            status: 'success',
            data: {
                home_name: homeName,
                total_tickets: response.results.length,
                repair_stats: stats,
                lastAction: lastAction
            }
        };
    } catch (error) {
        console.error('Error al obtener estadísticas de reparaciones para casa:', error);
        return {
            status: 'error',
            message: 'Error al obtener estadísticas de reparaciones para casa',
            error: error.message
        };
    }
}

export async function getTicketsStats() {
    try {
        // 1. Obtener lista única de casas
        const uniqueHomes = await getZendeskUniqueHomes();

        // 2. Estructura para almacenar estadísticas y todos los tickets
        const homeStats = {};
        let allTickets = [];

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

                // Agregar tickets al array total para precarga
                allTickets = allTickets.concat(tickets);
            } catch (error) {
                console.error(`Error procesando casa ${homeName}:`, error);
                continue;
            }
        }

        // 4. Precargar todos los datos necesarios una sola vez
        console.log(`Precargando datos para ${allTickets.length} tickets...`);
        await Promise.all([
            homeStatsHelpers.loadUserNames(allTickets),
            homeStatsHelpers.loadGroupNames(allTickets),
            homeStatsHelpers.preloadCustomFieldsOptions()
        ]);

        // 5. Procesar los tickets recientes para cada home (ahora súper rápido)
        homeStatsHelpers.processRecentTickets(homeStats);

        // 6. Convertir a array y retornar
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

export async function getTicketsSimpleStats(homeName = null, fromDate = null, toDate = null) {
    try {
        
        console.log(`Obteniendo estadísticas simples de tickets - Casa: ${homeName || 'Todas'}, Desde: ${fromDate || 'Sin filtro'}, Hasta: ${toDate || 'Sin filtro'}`);
        
        // IDs de los custom fields
        const INCIDENCE_AREA_FIELD_ID = 17926529031708;
        const CATEGORY_FIELD_ID = 17926673594140;
        const INCIDENCE_CAUSE_FIELD_ID = 21971920474524;
        const INCIDENCE_COST_FIELD_ID = 18458778087068;
        
        // Función auxiliar para obtener valor de custom field
        const getCustomFieldValue = (ticket, fieldId) => {
            if (!ticket.custom_fields) return null;
            const field = ticket.custom_fields.find(cf => cf.id === fieldId);
            return field ? field.value : null;
        };
        
        // Obtener todos los tickets con los filtros aplicados
        const response = await getAllZendeskTicketsForStats(homeName, fromDate, toDate);
        const allTickets = response.tickets;
        
        // Filtrar tickets que deben ser descartados (ej: tickets de propuesta de mejora)
        const tickets = allTickets.filter(ticket => !shouldDiscardTicket(ticket));
        
        const discardedCount = allTickets.length - tickets.length;
        if (discardedCount > 0) {
            console.log(`📊 ${discardedCount} ticket(s) descartado(s) por custom_status prohibido`);
        }
        
        // Contadores para las estadísticas
        let totalTickets = tickets.length;
        let resolvedTickets = 0;
        let inProgressTickets = 0;
        
        // Estados que consideramos como "resueltos"
        const resolvedStatuses = ['solved', 'closed'];
        
        // Contadores para categorías y áreas de incidencia
        const categoryCount = {};
        const incidenceAreaCount = {};
        const incidenceCauseCount = {};
        const incidenceCostCount = {};
        
        // Contadores de categorías por estado
        const categoryCountResolved = {};
        const categoryCountInProgress = {};
        
        // Procesar cada ticket para clasificar por estado y contar categorías/áreas
        tickets.forEach(ticket => {
            const isResolved = resolvedStatuses.includes(ticket.status);
            
            // Clasificar por estado
            if (isResolved) {
                resolvedTickets++;
            } else {
                inProgressTickets++;
            }
            
            // Contar categorías (solo si no es null/undefined/empty)
            const categoryValue = getCustomFieldValue(ticket, CATEGORY_FIELD_ID);
            if (categoryValue && categoryValue.trim() !== '') {
                // Conteo total
                categoryCount[categoryValue] = (categoryCount[categoryValue] || 0) + 1;
                
                // Conteo por estado
                if (isResolved) {
                    categoryCountResolved[categoryValue] = (categoryCountResolved[categoryValue] || 0) + 1;
                } else {
                    categoryCountInProgress[categoryValue] = (categoryCountInProgress[categoryValue] || 0) + 1;
                }
            }
            
            // Contar áreas de incidencia (solo si no es null/undefined/empty)
            const incidenceAreaValue = getCustomFieldValue(ticket, INCIDENCE_AREA_FIELD_ID);
            if (incidenceAreaValue && incidenceAreaValue.trim() !== '') {
                incidenceAreaCount[incidenceAreaValue] = (incidenceAreaCount[incidenceAreaValue] || 0) + 1;
            }
            
            // Contar causa de incidencia (solo si no es null/undefined/empty)
            const incidenceCauseValue = getCustomFieldValue(ticket, INCIDENCE_CAUSE_FIELD_ID);
            if (incidenceCauseValue && incidenceCauseValue.trim() !== '') {
                incidenceCauseCount[incidenceCauseValue] = (incidenceCauseCount[incidenceCauseValue] || 0) + 1;
            }
            
            // Contar costo de incidencia (solo si no es null/undefined/empty)
            const incidenceCostValue = getCustomFieldValue(ticket, INCIDENCE_COST_FIELD_ID);
            if (incidenceCostValue && incidenceCostValue.trim() !== '') {
                incidenceCostCount[incidenceCostValue] = (incidenceCostCount[incidenceCostValue] || 0) + 1;
            }
        });
        
        // Convertir contadores a arrays ordenados de mayor a menor
        const categoryStats = Object.entries(categoryCount)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count);
            
        const incidenceAreaStats = Object.entries(incidenceAreaCount)
            .map(([incidence_area, count]) => ({ incidence_area, count }))
            .sort((a, b) => b.count - a.count);
            
        const incidenceCauseStats = Object.entries(incidenceCauseCount)
            .map(([incidence_cause, count]) => ({ incidence_cause, count }))
            .sort((a, b) => b.count - a.count);
            
        const incidenceCostStats = Object.entries(incidenceCostCount)
            .map(([incidence_cost, count]) => ({ incidence_cost, count }))
            .sort((a, b) => b.count - a.count);
            
        // Función auxiliar para obtener top 3 categorías
        const getTop3Categories = (categoryCountObj) => {
            return Object.entries(categoryCountObj)
                .map(([category, count]) => ({ category, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 3);
        };
        
        // Top 3 categorías por grupo
        const top3CategoriesTotal = getTop3Categories(categoryCount);
        const top3CategoriesResolved = getTop3Categories(categoryCountResolved);
        const top3CategoriesInProgress = getTop3Categories(categoryCountInProgress);
        
        console.log(`Estadísticas calculadas - Total: ${totalTickets}, Resueltos: ${resolvedTickets}, En progreso: ${inProgressTickets}`);
        console.log(`Categorías encontradas: ${categoryStats.length}, Áreas de incidencia: ${incidenceAreaStats.length}`);
        console.log(`Causas de incidencia: ${incidenceCauseStats.length}, Costos de incidencia: ${incidenceCostStats.length}`);
        console.log(`Top 3 categorías - Total: ${top3CategoriesTotal.length}, Resueltos: ${top3CategoriesResolved.length}, En progreso: ${top3CategoriesInProgress.length}`);
        
        return {
            status: 'success',
            data: {
                totalTickets,
                resolvedTickets,
                inProgressTickets,
                filters: {
                    home: homeName || null,
                    from: fromDate || null,
                    to: toDate || null
                },
                percentages: {
                    resolved: totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100 * 10) / 10 : 0,
                    inProgress: totalTickets > 0 ? Math.round((inProgressTickets / totalTickets) * 100 * 10) / 10 : 0
                },
                categoryStats,
                incidenceAreaStats,
                incidenceCauseStats,
                incidenceCostStats,
                top3Categories: {
                    total: top3CategoriesTotal,
                    resolved: top3CategoriesResolved,
                    inProgress: top3CategoriesInProgress
                }
            },
            message: 'Estadísticas simples de tickets obtenidas exitosamente'
        };
        
    } catch (error) {
        console.error('Error al obtener estadísticas simples de tickets:', error);
        return {
            status: 'error',
            message: 'Error al obtener estadísticas simples de tickets',
            error: error.message
        };
    }
} 