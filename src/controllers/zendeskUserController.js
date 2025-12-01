import { getZendeskUsersService, getZendeskUserRequestedTicketsService, getHomeTicketsRequestersService } from '../services/zendeskUserService.js';

/**
 * Controlador para obtener la lista de usuarios de Zendesk
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function getZendeskUsersController(req, res) {
    try {
        // Obtener parámetros de query con valores por defecto
        const { page = 1, per_page = 100, role = 'end-user' } = req.query;
        
        // Llamar al servicio
        const result = await getZendeskUsersService(page, per_page, role);
        
        // Si hay error, devolver el código de estado apropiado
        if (result.status === 'error') {
            // Si es un error de validación, devolver 400
            if (result.message.includes('debe ser')) {
                return res.status(400).json(result);
            }
            
            // Si es un error de Zendesk (404, 401, etc.), devolver el código correspondiente
            if (result.error && result.error.status_code) {
                return res.status(result.error.status_code).json(result);
            }
            
            // Error genérico, devolver 500
            return res.status(500).json(result);
        }
        
        // Construir URLs completas para la paginación si existen
        const protocol = req.protocol;
        const host = req.get('host');
        
        if (result.data.next_page) {
            // Extraer los parámetros de la URL de next_page de Zendesk y construir nuestra URL
            const nextPageNum = parseInt(page, 10) + 1;
            const roleParam = role ? `&role=${encodeURIComponent(role)}` : '';
            result.data.next_page = `${protocol}://${host}/v1/zendesk-users?page=${nextPageNum}&per_page=${per_page}${roleParam}`;
        }
        
        if (result.data.previous_page) {
            // Extraer los parámetros de la URL de previous_page de Zendesk y construir nuestra URL
            const prevPageNum = parseInt(page, 10) - 1;
            const roleParam = role ? `&role=${encodeURIComponent(role)}` : '';
            result.data.previous_page = `${protocol}://${host}/v1/zendesk-users?page=${prevPageNum}&per_page=${per_page}${roleParam}`;
        }
        
        // Éxito, devolver 200
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error en getZendeskUsersController:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor al obtener usuarios de Zendesk',
            error: error.message
        });
    }
}

/**
 * Controlador para obtener los tickets solicitados por un usuario específico de Zendesk
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function getZendeskUserTicketsController(req, res) {
    try {
        // Obtener userId de los parámetros de la ruta
        const { userId } = req.params;
        
        // Validar que userId existe
        if (!userId) {
            return res.status(400).json({
                status: 'error',
                message: 'Se requiere el ID del usuario',
                data: null
            });
        }
        
        // Obtener parámetros de query con valores por defecto
        const { page = 1, per_page = 25 } = req.query;
        
        // Llamar al servicio
        const result = await getZendeskUserRequestedTicketsService(userId, page, per_page);
        
        // Si hay error, devolver el código de estado apropiado
        if (result.status === 'error') {
            // Si es un error de validación, devolver 400
            if (result.message.includes('debe ser') || result.message.includes('Se requiere')) {
                return res.status(400).json(result);
            }
            
            // Si es un error de Zendesk (404, 401, etc.), devolver el código correspondiente
            if (result.error && result.error.status_code) {
                return res.status(result.error.status_code).json(result);
            }
            
            // Error genérico, devolver 500
            return res.status(500).json(result);
        }
        
        // Construir URLs completas para la paginación si existen
        const protocol = req.protocol;
        const host = req.get('host');
        
        if (result.data.next_page) {
            // Construir URL de siguiente página
            const nextPageNum = parseInt(page, 10) + 1;
            result.data.next_page = `${protocol}://${host}/v1/zendesk-user-tickets/${userId}?page=${nextPageNum}&per_page=${per_page}`;
        }
        
        if (result.data.previous_page) {
            // Construir URL de página anterior
            const prevPageNum = parseInt(page, 10) - 1;
            result.data.previous_page = `${protocol}://${host}/v1/zendesk-user-tickets/${userId}?page=${prevPageNum}&per_page=${per_page}`;
        }
        
        // Éxito, devolver 200
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error en getZendeskUserTicketsController:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor al obtener tickets del usuario',
            error: error.message
        });
    }
}

/**
 * Controlador para obtener el listado de usuarios que han creado tickets en una casa específica
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export async function getHomeTicketsRequestersController(req, res) {
    try {
        // Obtener parámetros de query
        const { home, from } = req.query;
        
        // Validar que home existe (es obligatorio)
        if (!home) {
            return res.status(400).json({
                status: 'error',
                message: 'El parámetro home es obligatorio',
                data: null
            });
        }
        
        // Llamar al servicio
        const result = await getHomeTicketsRequestersService(home, from);
        
        // Si hay error, devolver el código de estado apropiado
        if (result.status === 'error') {
            // Si es un error de validación, devolver 400
            if (result.message.includes('obligatorio') || result.message.includes('formato')) {
                return res.status(400).json(result);
            }
            
            // Error genérico, devolver 500
            return res.status(500).json(result);
        }
        
        // Éxito, devolver 200
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error en getHomeTicketsRequestersController:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor al obtener requesters de tickets',
            error: error.message
        });
    }
}

