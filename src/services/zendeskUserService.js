import { getZendeskUsers, getZendeskUserRequestedTickets } from '../api/zendeskApi.js';
import { homeStatsHelpers } from '../helpers/homeStatsHelpers.js';
import { getTickets } from './ticketService.js';

/**
 * Obtiene la lista de usuarios de Zendesk
 * @param {number} page - Número de página (default: 1)
 * @param {number} per_page - Elementos por página (default: 100)
 * @param {string} role - Rol del usuario a filtrar (default: 'end-user')
 * @returns {Promise<Object>} Objeto con status, message y data
 */
export async function getZendeskUsersService(page = 1, per_page = 100, role = 'end-user') {
    try {
        // Validar parámetros
        const pageNum = parseInt(page, 10);
        const perPageNum = parseInt(per_page, 10);
        
        if (isNaN(pageNum) || pageNum < 1) {
            return {
                status: 'error',
                message: 'El parámetro page debe ser un número mayor a 0',
                data: null
            };
        }
        
        if (isNaN(perPageNum) || perPageNum < 1 || perPageNum > 100) {
            return {
                status: 'error',
                message: 'El parámetro per_page debe ser un número entre 1 y 100',
                data: null
            };
        }
        
        // Roles válidos según la documentación de Zendesk
        const validRoles = ['end-user', 'agent', 'admin'];
        if (role && !validRoles.includes(role)) {
            return {
                status: 'error',
                message: `El rol debe ser uno de: ${validRoles.join(', ')}`,
                data: null
            };
        }
        
        console.log(`Obteniendo usuarios de Zendesk - Página: ${pageNum}, Por página: ${perPageNum}, Rol: ${role}`);
        
        // Llamar a la API de Zendesk
        const response = await getZendeskUsers(pageNum, perPageNum, role);
        
        // Formatear usuarios para incluir solo los campos solicitados
        const formattedUsers = (response.users || []).map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            locale: user.locale,
            role: user.role,
            user_fields: user.user_fields || {}
        }));
        
        // La respuesta de Zendesk tiene la estructura:
        // { users: [...], count: number, next_page: url, previous_page: url }
        return {
            status: 'success',
            message: 'Usuarios obtenidos exitosamente',
            data: {
                users: formattedUsers,
                count: response.count || 0,
                next_page: response.next_page || null,
                previous_page: response.previous_page || null,
                page: pageNum,
                per_page: perPageNum,
                role: role
            }
        };
    } catch (error) {
        console.error('Error en getZendeskUsersService:', error);
        
        // Manejar errores específicos de Zendesk
        if (error.response) {
            const statusCode = error.response.status;
            const errorMessage = error.response.data?.description || error.response.data?.error || 'Error al obtener usuarios de Zendesk';
            
            return {
                status: 'error',
                message: errorMessage,
                data: null,
                error: {
                    status_code: statusCode,
                    details: error.response.data
                }
            };
        }
        
        return {
            status: 'error',
            message: 'Error al obtener usuarios de Zendesk',
            data: null,
            error: error.message
        };
    }
}

/**
 * Obtiene los tickets solicitados por un usuario específico de Zendesk
 * @param {number|string} userId - ID del usuario en Zendesk
 * @param {number} page - Número de página (default: 1)
 * @param {number} per_page - Elementos por página (default: 25)
 * @returns {Promise<Object>} Objeto con status, message y data
 */
export async function getZendeskUserRequestedTicketsService(userId, page = 1, per_page = 25) {
    try {
        // Validar userId
        const userIdNum = parseInt(userId, 10);
        if (isNaN(userIdNum) || userIdNum < 1) {
            return {
                status: 'error',
                message: 'El ID del usuario debe ser un número entero positivo',
                data: null
            };
        }
        
        // Validar parámetros de paginación
        const pageNum = parseInt(page, 10);
        const perPageNum = parseInt(per_page, 10);
        
        if (isNaN(pageNum) || pageNum < 1) {
            return {
                status: 'error',
                message: 'El parámetro page debe ser un número mayor a 0',
                data: null
            };
        }
        
        if (isNaN(perPageNum) || perPageNum < 1 || perPageNum > 100) {
            return {
                status: 'error',
                message: 'El parámetro per_page debe ser un número entre 1 y 100',
                data: null
            };
        }
        
        console.log(`Obteniendo tickets solicitados por usuario ${userIdNum} - Página: ${pageNum}, Por página: ${perPageNum}`);
        
        // Llamar a la API de Zendesk
        const response = await getZendeskUserRequestedTickets(userIdNum, pageNum, perPageNum);
        
        // Obtener todos los tickets de la respuesta
        const tickets = response.tickets || [];
        
        // Precargar todos los datos necesarios en paralelo (igual que en ticketService)
        await Promise.all([
            homeStatsHelpers.loadUserNames(tickets),
            homeStatsHelpers.loadGroupNames(tickets),
            homeStatsHelpers.preloadCustomFieldsOptions()
        ]);
        
        // Formatear todos los tickets con el mismo formato que /v1/tickets
        const formattedTickets = tickets.map(ticket =>
            homeStatsHelpers.formatTicket(ticket)
            //ticket
        );
        
        // La respuesta de Zendesk tiene la estructura:
        // { tickets: [...], count: number, next_page: url, previous_page: url }
        return {
            status: 'success',
            message: 'Tickets obtenidos exitosamente',
            data: {
                tickets: formattedTickets,
                count: response.count || 0,
                next_page: response.next_page || null,
                previous_page: response.previous_page || null,
                page: pageNum,
                per_page: perPageNum,
                user_id: userIdNum
            }
        };
    } catch (error) {
        console.error('Error en getZendeskUserRequestedTicketsService:', error);
        
        // Manejar errores específicos de Zendesk
        if (error.response) {
            const statusCode = error.response.status;
            const errorMessage = error.response.data?.description || error.response.data?.error || 'Error al obtener tickets del usuario';
            
            // Si el usuario no existe, Zendesk devuelve 404
            if (statusCode === 404) {
                return {
                    status: 'error',
                    message: `No se encontró el usuario con ID: ${userId}`,
                    data: null,
                    error: {
                        status_code: statusCode,
                        details: error.response.data
                    }
                };
            }
            
            return {
                status: 'error',
                message: errorMessage,
                data: null,
                error: {
                    status_code: statusCode,
                    details: error.response.data
                }
            };
        }
        
        return {
            status: 'error',
            message: 'Error al obtener tickets del usuario',
            data: null,
            error: error.message
        };
    }
}

/**
 * Obtiene el listado de usuarios que han creado tickets en una casa específica
 * @param {string} homeName - Nombre de la casa (obligatorio)
 * @param {string} fromDate - Fecha desde la cual filtrar (opcional, formato YYYY-MM-DD)
 * @returns {Promise<Object>} Objeto con status, message y data
 */
export async function getHomeTicketsRequestersService(homeName, fromDate = null) {
    try {
        // Validar que homeName es obligatorio
        if (!homeName || typeof homeName !== 'string' || homeName.trim() === '') {
            return {
                status: 'error',
                message: 'El parámetro home es obligatorio',
                data: null
            };
        }
        
        // Validar formato de fecha si se proporciona
        if (fromDate) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(fromDate)) {
                return {
                    status: 'error',
                    message: 'El formato de fecha debe ser YYYY-MM-DD',
                    data: null
                };
            }
        }
        
        console.log(`Obteniendo requesters de tickets para casa: ${homeName}, desde: ${fromDate || 'sin filtro'}`);
        
        // Obtener todos los tickets con paginación automática
        let allTickets = [];
        let page = 1;
        let hasMorePages = true;
        const per_page = 100; // Usar máximo por página para eficiencia
        
        while (hasMorePages) {
            try {
                const result = await getTickets(page, per_page, 'created_at', 'desc', homeName, fromDate, null);
                
                if (result.status === 'error') {
                    return result;
                }
                
                // Agregar tickets a la lista
                if (result.data && result.data.tickets && result.data.tickets.length > 0) {
                    allTickets = allTickets.concat(result.data.tickets);
                    console.log(`Página ${page}: ${result.data.tickets.length} tickets obtenidos. Total acumulado: ${allTickets.length}`);
                    
                    // Verificar si hay más páginas
                    hasMorePages = !!result.data.next_page;
                    page++;
                } else {
                    hasMorePages = false;
                }
                
                // Seguridad: evitar bucles infinitos
                if (page > 1000) {
                    console.warn('Se alcanzó el límite de 1000 páginas. Deteniendo la consulta.');
                    break;
                }
            } catch (error) {
                console.error(`Error al obtener página ${page}:`, error);
                return {
                    status: 'error',
                    message: 'Error al obtener tickets',
                    data: null,
                    error: error.message
                };
            }
        }
        
        console.log(`Total de tickets obtenidos: ${allTickets.length}`);
        
        // Agrupar tickets por requester_id y contar
        const requesterStats = {};
        
        allTickets.forEach(ticket => {
            const requesterId = ticket.requester_id;
            const requesterName = ticket.requester_name || 'Sin nombre';
            
            if (requesterId) {
                if (!requesterStats[requesterId]) {
                    requesterStats[requesterId] = {
                        requester_id: requesterId,
                        requester_name: requesterName,
                        count: 0
                    };
                }
                requesterStats[requesterId].count++;
            }
        });
        
        // Convertir a array y ordenar por count descendente
        const requesters = Object.values(requesterStats).sort((a, b) => b.count - a.count);
        
        // Calcular total de tickets
        const totalTickets = allTickets.length;
        
        console.log(`Total de requesters únicos: ${requesters.length}`);
        
        return {
            status: 'success',
            message: 'Requesters obtenidos exitosamente',
            data: {
                home: homeName,
                from: fromDate || null,
                requesters: requesters,
                total_requesters: requesters.length,
                total_tickets: totalTickets
            }
        };
    } catch (error) {
        console.error('Error en getHomeTicketsRequestersService:', error);
        return {
            status: 'error',
            message: 'Error al obtener requesters de tickets',
            data: null,
            error: error.message
        };
    }
}

