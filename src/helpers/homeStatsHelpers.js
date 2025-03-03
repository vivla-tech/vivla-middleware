import axios from 'axios';
import { zendeskConfig } from '../config/zendesk.js';

// Constante compartida
const HOME_FIELD_ID = 17925940459804;

export const homeStatsHelpers = {
    // Obtener lista única de casas usando la API de búsqueda de Zendesk
    async getUniqueHomes() {
        try {
            console.log('Obteniendo lista única de casas...');

            const response = await axios.get(
                `${zendeskConfig.url}/search.json?query=custom_field_${HOME_FIELD_ID}:*&include=users&sort_by=created_at&sort_order=desc`,
                {
                    headers: zendeskConfig.headers
                }
            );

            if (!response.data || !response.data.results) {
                throw new Error('No se encontraron datos de casas');
            }

            const uniqueHomes = [...new Set(
                response.data.results
                    .map(ticket => {
                        const homeField = ticket.custom_fields?.find(
                            field => field.id === HOME_FIELD_ID
                        );
                        return homeField?.value;
                    })
                    .filter(value => value && value !== 'unknown')
            )];

            console.log(`Se encontraron ${uniqueHomes.length} casas únicas:`, uniqueHomes);
            return uniqueHomes;
        } catch (error) {
            console.error('Error al obtener lista de casas:', error.message);
            throw error;
        }
    },

    // Obtener tickets de una casa específica con paginación
    async getTicketsForHome(homeName) {
        try {
            let allTickets = [];
            let currentPage = 1;
            let hasMorePages = true;

            console.log(`Obteniendo tickets para la casa: ${homeName}`);

            while (hasMorePages) {
                console.log(`Página ${currentPage} para ${homeName}...`);

                const response = await axios.get(
                    `${zendeskConfig.url}/search.json?query=custom_field_${HOME_FIELD_ID}:${encodeURIComponent(homeName)}&page=${currentPage}&per_page=100&include=users&sort_by=created_at&sort_order=desc`,
                    {
                        headers: zendeskConfig.headers
                    }
                );

                if (!response.data || !response.data.results) {
                    throw new Error(`No se encontraron datos de tickets para la casa ${homeName}`);
                }

                allTickets = allTickets.concat(response.data.results);
                hasMorePages = !!response.data.next_page;
                currentPage++;

                console.log(`Página ${currentPage - 1} procesada para ${homeName}. Tickets acumulados: ${allTickets.length}`);

                await new Promise(resolve => setTimeout(resolve, 100));
            }

            console.log(`Total de tickets obtenidos para ${homeName}: ${allTickets.length}`);
            return allTickets;

        } catch (error) {
            console.error(`Error al obtener tickets para la casa ${homeName}:`, error.message);
            throw error;
        }
    },

    // Inicializar estructura de estadísticas para un home
    initializeHomeStats(homeName) {
        return {
            name: homeName,
            total_tickets: 0,
            tickets_new: 0,
            tickets_open: 0,
            tickets_pending: 0,
            tickets_hold: 0,
            tickets_solved: 0,
            tickets_closed: 0,
            all_tickets: [],
            last_tickets: []
        };
    },

    // Procesar un ticket e incorporarlo a las estadísticas
    processTicket(ticket, homeStats) {
        const homeField = ticket.custom_fields.find(field => field.id === HOME_FIELD_ID);
        const homeName = homeField && homeField.value ? homeField.value : 'unknown';

        if (!homeStats[homeName]) {
            homeStats[homeName] = this.initializeHomeStats(homeName);
        }

        homeStats[homeName].total_tickets++;
        this.incrementStatusCounter(ticket.status, homeStats[homeName]);
        homeStats[homeName].all_tickets.push(ticket);

        return homeName;
    },

    // Incrementar contador según el estado del ticket
    incrementStatusCounter(status, homeStatItem) {
        switch (status) {
            case 'new':
                homeStatItem.tickets_new++;
                break;
            case 'open':
                homeStatItem.tickets_open++;
                break;
            case 'pending':
                homeStatItem.tickets_pending++;
                break;
            case 'hold':
                homeStatItem.tickets_hold++;
                break;
            case 'solved':
                homeStatItem.tickets_solved++;
                break;
            case 'closed':
                homeStatItem.tickets_closed++;
                break;
            default:
                console.log(`Estado de ticket no contemplado: ${status}`);
                break;
        }
    },

    // Procesar los últimos tickets para cada home
    processRecentTickets(homeStats) {
        Object.keys(homeStats).forEach(homeName => {
            homeStats[homeName].all_tickets.sort((a, b) => {
                return new Date(b.updated_at) - new Date(a.updated_at);
            });

            homeStats[homeName].last_tickets = homeStats[homeName].all_tickets
                .slice(0, 10)
                .map(ticket => this.formatTicket(ticket));

            delete homeStats[homeName].all_tickets;
        });
    },

    // Formatear un ticket para incluir solo los campos necesarios
    formatTicket(ticket) {
        return {
            id: ticket.id,
            subject: ticket.subject,
            status: ticket.status,
            created_at: ticket.created_at,
            updated_at: ticket.updated_at,
            priority: ticket.priority,
            requester_id: ticket.requester_id,
            assignee_id: ticket.assignee_id,
            description: ticket.description
        };
    }
}; 