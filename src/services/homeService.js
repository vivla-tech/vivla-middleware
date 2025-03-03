import { homeStatsHelpers } from '../helpers/homeStatsHelpers.js';

export async function getHomeStats() {
    try {
        // 1. Obtener lista única de casas
        const uniqueHomes = await homeStatsHelpers.getUniqueHomes();

        // 2. Estructura para almacenar estadísticas
        const homeStats = {};

        // 3. Procesar cada casa
        for (const homeName of uniqueHomes) {
            try {
                // Obtener tickets de esta casa
                const tickets = await homeStatsHelpers.getTicketsForHome(homeName);

                // Inicializar estadísticas para esta casa
                homeStats[homeName] = homeStatsHelpers.initializeHomeStats(homeName);

                // Procesar tickets de esta casa
                tickets.forEach(ticket => {
                    homeStatsHelpers.processTicket(ticket, homeStats);
                });
            } catch (error) {
                console.error(`Error procesando casa ${homeName}:`, error);
                continue;
            }
        }

        // 4. Procesar los tickets recientes para cada home
        homeStatsHelpers.processRecentTickets(homeStats);

        // 5. Convertir a array y retornar
        return {
            status: 'success',
            data: {
                homes: Object.values(homeStats)
            }
        };
    } catch (error) {
        console.error('Error al obtener estadísticas de homes:', error);
        throw error;
    }
} 