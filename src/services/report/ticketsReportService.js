/**
 * Servicio para obtener información de tickets desde Zendesk API
 * Este servicio realizará llamadas externas a la API de Zendesk
 */

/**
 * Obtiene información de tickets relacionados con una casa
 * @param {string} homeId - ID de la casa
 * @param {string} year - Año del reporte (ej: '2025')
 * @returns {Promise<Object>} Objeto con información de tickets
 */
export async function getHouseTicketsInfo(homeId, year) {
    try {
        // TODO: Implementar llamada a Zendesk API
        // const tickets = await getZendeskTicketsForHome(homeId, year);
        
        // Mock data
        const mockTicketsData = {
            resolved_tickets: 5,
            pending_tickets: 1,
            in_valoration_tickets: 0,
            total_tickets: 6,
            tickets: [
                {
                    ticket_id: 'TICKET001',
                    status: 'solved',
                    subject: 'Reparación caldera',
                    created_at: '2025-03-15',
                    solved_at: '2025-03-20'
                },
                {
                    ticket_id: 'TICKET002',
                    status: 'open',
                    subject: 'Sustitución persianas',
                    created_at: '2025-04-10'
                }
            ]
        };

        return {
            status: 'success',
            data: mockTicketsData
        };
    } catch (error) {
        console.error(`Error al obtener tickets de la casa ${homeId}:`, error);
        return {
            status: 'error',
            message: `No se pudieron obtener los tickets`,
            error: error.message,
            data: null
        };
    }
}

/**
 * Obtiene información de mejoras y reparaciones realizadas
 * @param {string} homeId - ID de la casa
 * @param {string} year - Año del reporte
 * @returns {Promise<Object>} Objeto con información de mejoras y reparaciones
 */
export async function getImprovementsAndRepairsInfo(homeId, year) {
    try {
        // TODO: Implementar llamada a Zendesk API para obtener mejoras y reparaciones
        
        // Mock data
        const mockImprovementsData = {
            improvements_made_total_number: 3,
            repairs_total_number: 2,
            improvements_made_breakdown: 'Renovación baño, Instalación aire acondicionado, Mejora iluminación',
            repairs_made_breakdown: 'Reparación caldera, Sustitución persianas',
            improvements: [
                {
                    type: 'improvement',
                    description: 'Renovación baño',
                    date: '2025-02-15',
                    cost: 3500.00
                },
                {
                    type: 'improvement',
                    description: 'Instalación aire acondicionado',
                    date: '2025-03-01',
                    cost: 2800.00
                }
            ],
            repairs: [
                {
                    type: 'repair',
                    description: 'Reparación caldera',
                    date: '2025-03-20',
                    cost: 450.00
                }
            ]
        };

        return {
            status: 'success',
            data: mockImprovementsData
        };
    } catch (error) {
        console.error(`Error al obtener mejoras y reparaciones de la casa ${homeId}:`, error);
        return {
            status: 'error',
            message: `No se pudieron obtener las mejoras y reparaciones`,
            error: error.message,
            data: null
        };
    }
}

/**
 * Obtiene valoraciones y comentarios de estancias
 * @param {string} homeId - ID de la casa
 * @param {string} year - Año del reporte
 * @returns {Promise<Object>} Objeto con valoraciones y comentarios
 */
export async function getStayValorationsInfo(homeId, year) {
    try {
        // TODO: Implementar llamada a API para obtener valoraciones
        
        // Mock data
        const mockValorationsData = {
            stay_valoration: 4.8,
            experience_valoration: 4.9,
            last_comments: 'Excelente experiencia, la casa está en perfecto estado',
            total_reviews: 12,
            average_rating: 4.85
        };

        return {
            status: 'success',
            data: mockValorationsData
        };
    } catch (error) {
        console.error(`Error al obtener valoraciones de la casa ${homeId}:`, error);
        return {
            status: 'error',
            message: `No se pudieron obtener las valoraciones`,
            error: error.message,
            data: null
        };
    }
}









