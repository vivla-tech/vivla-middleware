import { getZendeskUsers, getZendeskUserRequestedTickets } from '../api/zendeskApi.js';

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
        
        // La respuesta de Zendesk tiene la estructura:
        // { users: [...], count: number, next_page: url, previous_page: url }
        return {
            status: 'success',
            message: 'Usuarios obtenidos exitosamente',
            data: {
                users: response.users || [],
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
        
        // La respuesta de Zendesk tiene la estructura:
        // { tickets: [...], count: number, next_page: url, previous_page: url }
        return {
            status: 'success',
            message: 'Tickets obtenidos exitosamente',
            data: {
                tickets: response.tickets || [],
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

