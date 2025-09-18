import { getZendeskTicketById, getZendeskTickets, getZendeskTicketsByCustomStatus, getZendeskRepairTickets, getZendeskHomeRepairTickets, getZendeskUniqueHomes, getZendeskTicketsForHome } from '../api/zendeskApi.js';
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

export async function getTickets(page = 1, per_page = 25, sort_by = 'created_at', sort_order = 'desc', homeName = null) {
    try {
        const response = await getZendeskTickets(page, per_page, sort_by, sort_order, homeName);

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

export async function getRepairTickets(page = 1, per_page = 25, sort_by = 'created_at', sort_order = 'desc', homeName = null) {
    try {
        const response = await getZendeskRepairTickets(page, per_page, sort_by, sort_order, homeName);

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

        return {
            status: 'success',
            data: {
                home_name: homeName,
                total_tickets: response.results.length,
                repair_stats: stats
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