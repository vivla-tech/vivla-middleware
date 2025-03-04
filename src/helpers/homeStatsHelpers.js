import axios from 'axios';
import { zendeskConfig } from '../config/zendesk.js';

// Constante compartida
const HOME_FIELD_ID = 17925940459804;

// Cache para IDs de usuario a nombres
let userCache = {};

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
            requester_name: this.getUserName(ticket, 'requester'),
            assignee_name: this.getUserName(ticket, 'assignee'),
            description: ticket.description
        };
    },

    // Obtener el nombre de un usuario (requester o assignee) desde el ticket o del cache
    getUserName(ticket, userType = 'requester') {
        const userCache = global.userCache || (global.userCache = {});
        const userId = userType === 'requester' ? ticket.requester_id : ticket.assignee_id;

        // Si no hay userId, devolver valor por defecto
        if (!userId) return userType === 'requester' ? 'Sin solicitante' : 'Sin asignado';

        // Si el ticket ya tiene la información del usuario
        if (ticket.via && ticket.via.source && ticket.via.source.from) {
            const userName = ticket.via.source.from.name;
            if (userName) {
                userCache[userId] = userName;
                return userName;
            }
        }

        // Verificar si tenemos el nombre en el cache
        if (userCache[userId]) {
            return userCache[userId];
        }

        // Si el ticket tiene la propiedad users (incluida por la API)
        if (ticket.users) {
            const user = ticket.users.find(user => user.id === userId);
            if (user && user.name) {
                userCache[userId] = user.name;
                return user.name;
            }
        }

        // Si no tenemos el nombre aún, devolvemos el ID como cadena provisional
        return `ID: ${userId}`;
    },

    // Cargar nombres de usuarios para una lista de tickets
    async loadUserNames(tickets) {
        try {
            const userCache = global.userCache || (global.userCache = {});
            const requesterIds = [];
            const assigneeIds = [];

            // Recopilar IDs de usuarios que no están en el cache
            tickets.forEach(ticket => {
                if (ticket.requester_id && !userCache[ticket.requester_id]) {
                    requesterIds.push(ticket.requester_id);
                }
                if (ticket.assignee_id && !userCache[ticket.assignee_id]) {
                    assigneeIds.push(ticket.assignee_id);
                }
            });

            // Combinar ambos arrays y eliminar duplicados
            const userIds = [...new Set([...requesterIds, ...assigneeIds])];

            // Si no hay usuarios para cargar, salir
            if (userIds.length === 0) return;

            console.log(`Cargando nombres para ${userIds.length} usuarios...`);

            // Hacer consulta a Zendesk para obtener usuarios
            const response = await axios.get(
                `${zendeskConfig.url}/users/show_many.json?ids=${userIds.join(',')}`,
                { headers: zendeskConfig.headers }
            );

            // Guardar nombres en caché
            if (response.data && response.data.users) {
                response.data.users.forEach(user => {
                    userCache[user.id] = user.name;
                });
            }
        } catch (error) {
            console.error('Error al cargar nombres de usuarios:', error);
        }
    }
}; 