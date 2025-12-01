import axios from 'axios';
import { zendeskConfig } from '../config/zendesk.js';

// Constante compartida
const HOME_FIELD_ID = 17925940459804;
const DESTINATION_FIELD_ID = 18534461108892;
const RESOLUTION_TEAM_FIELD_ID = 17926240467100;
const INICENCE_AREA_FIELD_ID = 17926529031708;
const CATEGORY_FIELD_ID = 17926673594140;
const FIX_STATUS_FIELD_ID = 17926767041308;
const PAYER_FIELD_ID = 17926800591004;
const OWNERS_APPROVAL_FIELD_ID = 17926777030556;
const BLOCK_FIELD_ID = 21971943722140;
const FINANCE_APPROVAL_FIELD_ID = 17926839233180;
const INCIDENCE_CAUSE_FIELD_ID = 21971920474524;
const INCIDENCE_COST_FIELD_ID = 18458778087068;
const INCIDENCE_DEDICATED_HOURS_FIELD_ID = 21971962066332;

// Cache para IDs de usuario a nombres
let userCache = {};

// Cache para IDs de grupo a nombres
let groupCache = {};

// Cache para configuraciones de campos personalizados
let customFieldCache = {};

export const homeStatsHelpers = {
    // Obtener todas las opciones configuradas del custom field HOME_FIELD_ID desde ticket_fields
    async getAllZendeskHomeValues() {
        try {
            console.log('Obteniendo todas las opciones configuradas del custom field HOME_FIELD_ID...');

            const response = await axios.get(
                `${zendeskConfig.url}/ticket_fields.json`,
                {
                    headers: zendeskConfig.headers
                }
            );

            if (!response.data || !response.data.ticket_fields) {
                throw new Error('No se encontraron campos de ticket en Zendesk');
            }

            // Buscar el custom field específico por su ID
            const homeField = response.data.ticket_fields.find(
                field => field.id === HOME_FIELD_ID
            );

            if (!homeField) {
                throw new Error(`No se encontró el custom field con ID: ${HOME_FIELD_ID}`);
            }

            if (!homeField.custom_field_options || homeField.custom_field_options.length === 0) {
                console.log('El custom field no tiene opciones configuradas');
                return {
                    status: 'success',
                    data: [],
                    count: 0
                };
            }

            // Extraer todos los valores de las opciones configuradas
            const homeValues = homeField.custom_field_options.map(option => option.value);
            
            console.log(`Se encontraron ${homeValues.length} opciones configuradas para el custom field HOME_FIELD_ID`);

            return {
                status: 'success',
                data: homeValues,
                count: homeValues.length,
                field_info: {
                    id: homeField.id,
                    title: homeField.title,
                    type: homeField.type
                }
            };

        } catch (error) {
            console.error('Error al obtener opciones del custom field HOME_FIELD_ID:', error);
            return {
                status: 'error',
                message: 'Error al obtener opciones del custom field HOME_FIELD_ID',
                error: error.message
            };
        }
    },

    // Función legacy para obtener valores únicos desde tickets (mantener por compatibilidad)
    async getAllZendeskHomeValuesFromTickets() {
        try {
            console.log('Obteniendo todos los valores de casas de Zendesk desde tickets...');

            const response = await axios.get(
                `${zendeskConfig.url}/search.json?query=custom_field_${HOME_FIELD_ID}:*&include=users&sort_by=created_at&sort_order=desc`,
                {
                    headers: zendeskConfig.headers
                }
            );

            if (!response.data || !response.data.results) {
                throw new Error('No se encontraron datos de casas en Zendesk');
            }

            // Extraer todos los valores únicos del custom field HOME_FIELD_ID
            const homeValues = new Set();
            
            response.data.results.forEach(ticket => {
                const homeField = ticket.custom_fields?.find(
                    field => field.id === HOME_FIELD_ID
                );
                if (homeField && homeField.value) {
                    homeValues.add(homeField.value);
                }
            });

            const uniqueValues = Array.from(homeValues);
            console.log(`Se encontraron ${uniqueValues.length} valores únicos de casas en Zendesk desde tickets`);

            return {
                status: 'success',
                data: uniqueValues,
                count: uniqueValues.length
            };

        } catch (error) {
            console.error('Error al obtener valores de casas de Zendesk desde tickets:', error);
            return {
                status: 'error',
                message: 'Error al obtener valores de casas de Zendesk desde tickets',
                error: error.message
            };
        }
    },

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
            custom_status: ticket.custom_status_id,
            created_at: ticket.created_at,
            updated_at: ticket.updated_at,
            priority: ticket.priority,
            requester_name: this.getUserName(ticket, 'requester'),
            requester_id: ticket.requester_id,
            assignee_name: this.getUserName(ticket, 'assignee'),
            group_name: this.getGroupName(ticket),
            followers_names: this.getFollowersNames(ticket),
            description: ticket.description,
            home_name: ticket.custom_fields.find(field => field.id === HOME_FIELD_ID)?.value,
            tags: ticket.tags,
            destination: ticket.custom_fields.find(field => field.id === DESTINATION_FIELD_ID)?.value,
            // Campos personalizados con nombres legibles
            resolution_team: this.getResolutionTeamNameSync(ticket),
            incidence_area: this.getIncidenceAreaNameSync(ticket),
            category: this.getCategoryNameSync(ticket),
            fix_status: this.getFixStatusNameSync(ticket),
            payer: this.getPayerNameSync(ticket),
            owners_approval: this.getOwnersApprovalNameSync(ticket),
            block: this.getBlockNameSync(ticket),
            finance_approval: this.getFinanceApprovalNameSync(ticket),
            incidence_cause: this.getIncidenceCauseNameSync(ticket),
            incidence_cost: ticket.custom_fields.find(field => field.id === INCIDENCE_COST_FIELD_ID)?.value,
            incidence_dedicated_hours: ticket.custom_fields.find(field => field.id === INCIDENCE_DEDICATED_HOURS_FIELD_ID)?.value
        };
    },

    // Obtener el nombre de un usuario (requester o assignee) desde el ticket o del cache
    getUserName(ticket, userType = 'requester') {
        const userCache = global.userCache || (global.userCache = {});
        const userId = userType === 'requester' ? ticket.requester_id : ticket.assignee_id;

        // Si no hay userId, devolver 'vivla' por defecto
        if (!userId) return 'vivla';

        // Si el ticket ya tiene la información del usuario
        if (ticket.via && ticket.via.source && ticket.via.source.from) {
            const userName = ticket.via.source.from.name;
            if (userName && userName.trim() !== '') {
                userCache[userId] = userName;
                return userName;
            }
        }

        // Verificar si tenemos el nombre en el cache
        if (userCache[userId] && userCache[userId].trim() !== '') {
            return userCache[userId];
        }

        // Si el ticket tiene la propiedad users (incluida por la API)
        if (ticket.users) {
            const user = ticket.users.find(user => user.id === userId);
            if (user && user.name && user.name.trim() !== '') {
                userCache[userId] = user.name;
                return user.name;
            }
        }

        // Si no tenemos el nombre o está vacío, devolvemos 'vivla' por defecto
        return 'vivla';
    },

    // Obtener el nombre de un grupo desde el ticket o del cache
    getGroupName(ticket) {
        const groupCache = global.groupCache || (global.groupCache = {});
        const groupId = ticket.group_id;

        // Si no hay group_id, devolver valor por defecto
        if (!groupId) return 'Sin grupo asignado';

        // Verificar si tenemos el nombre en el cache
        if (groupCache[groupId]) {
            return groupCache[groupId];
        }

        // Si el ticket tiene la propiedad groups (incluida por la API)
        if (ticket.groups) {
            const group = ticket.groups.find(group => group.id === groupId);
            if (group && group.name) {
                groupCache[groupId] = group.name;
                return group.name;
            }
        }

        // Si no tenemos el nombre aún, devolvemos el ID como cadena provisional
        return `Grupo ID: ${groupId}`;
    },

    // Obtener los nombres de los followers desde el ticket o del cache
    getFollowersNames(ticket) {
        const userCache = global.userCache || (global.userCache = {});
        const followerIds = ticket.follower_ids || [];

        // Si no hay followers, devolver array vacío
        if (!followerIds || !Array.isArray(followerIds) || followerIds.length === 0) {
            return [];
        }

        // Mapear IDs a nombres
        return followerIds.map(followerId => {
            // Verificar si tenemos el nombre en el cache
            if (userCache[followerId]) {
                return userCache[followerId];
            }

            // Si el ticket tiene la propiedad users (incluida por la API)
            if (ticket.users) {
                const user = ticket.users.find(user => user.id === followerId);
                if (user && user.name) {
                    userCache[followerId] = user.name;
                    return user.name;
                }
            }

            // Si no tenemos el nombre aún, devolvemos el ID como cadena provisional
            return `ID: ${followerId}`;
        });
    },

    // Obtener el nombre legible de un campo personalizado basado en su valor
    async getCustomFieldOptionName(fieldId, fieldValue) {
        try {
            const customFieldCache = global.customFieldCache || (global.customFieldCache = {});
            
            // Si no hay valor, retornar valor por defecto
            if (!fieldValue) return fieldValue || '';

            // Verificar si tenemos la configuración del campo en cache
            if (!customFieldCache[fieldId]) {
                console.log(`Cargando configuración para el campo personalizado ${fieldId}...`);
                
                const response = await axios.get(
                    `${zendeskConfig.url}/ticket_fields/${fieldId}.json`,
                    { headers: zendeskConfig.headers }
                );

                if (response.data && response.data.ticket_field) {
                    customFieldCache[fieldId] = response.data.ticket_field;
                } else {
                    console.warn(`No se pudo obtener la configuración del campo ${fieldId}`);
                    return fieldValue;
                }
            }

            const fieldConfig = customFieldCache[fieldId];
            
            // Si el campo no tiene opciones personalizadas, retornar el valor tal como está
            if (!fieldConfig.custom_field_options || !Array.isArray(fieldConfig.custom_field_options)) {
                return fieldValue;
            }

            // Buscar la opción que coincida con el valor
            const option = fieldConfig.custom_field_options.find(opt => opt.value === fieldValue);
            
            // Retornar el nombre legible si se encuentra, sino el valor original
            return option ? option.name : fieldValue;

        } catch (error) {
            console.error(`Error al obtener nombre del campo personalizado ${fieldId}:`, error);
            return fieldValue; // Retornar el valor original en caso de error
        }
    },

    // Precargar las opciones de múltiples campos personalizados
    async preloadCustomFieldsOptions() {
        try {
            const customFieldCache = global.customFieldCache || (global.customFieldCache = {});
            
            // Lista de todos los campos personalizados que necesitamos precargar
            const fieldsToPreload = [
                { id: RESOLUTION_TEAM_FIELD_ID, name: 'Resolution Team' },
                { id: INICENCE_AREA_FIELD_ID, name: 'Incidence Area' },
                { id: CATEGORY_FIELD_ID, name: 'Category' },
                { id: FIX_STATUS_FIELD_ID, name: 'Fix Status' },
                { id: PAYER_FIELD_ID, name: 'Payer' },
                { id: OWNERS_APPROVAL_FIELD_ID, name: 'Owners Approval' },
                { id: BLOCK_FIELD_ID, name: 'Block' },
                { id: FINANCE_APPROVAL_FIELD_ID, name: 'Finance Approval' },
                { id: INCIDENCE_CAUSE_FIELD_ID, name: 'Incidence Cause' }
            ];

            // Filtrar solo los campos que no están ya cargados
            const fieldsNeedingLoad = fieldsToPreload.filter(field => !customFieldCache[field.id]);
            
            if (fieldsNeedingLoad.length === 0) {
                console.log('Todos los campos personalizados ya están precargados');
                return;
            }

            console.log(`Precargando ${fieldsNeedingLoad.length} campos personalizados...`);

            // Cargar todos los campos en paralelo
            const promises = fieldsNeedingLoad.map(async (field) => {
                try {
                    const response = await axios.get(
                        `${zendeskConfig.url}/ticket_fields/${field.id}.json`,
                        { headers: zendeskConfig.headers }
                    );

                    if (response.data && response.data.ticket_field) {
                        customFieldCache[field.id] = response.data.ticket_field;
                        console.log(`${field.name} cargado: ${response.data.ticket_field.custom_field_options?.length || 0} opciones`);
                    }
                } catch (error) {
                    console.error(`Error al cargar ${field.name}:`, error);
                }
            });

            await Promise.all(promises);
            console.log('Precarga de campos personalizados completada');

        } catch (error) {
            console.error('Error al precargar opciones de campos personalizados:', error);
        }
    },

    // Precargar las opciones del campo resolution team (mantenida para compatibilidad)
    async preloadResolutionTeamOptions() {
        await this.preloadCustomFieldsOptions();
    },

    // Función genérica para obtener el nombre legible de cualquier campo personalizado (versión síncrona)
    getCustomFieldNameSync(ticket, fieldId) {
        const customFieldCache = global.customFieldCache || (global.customFieldCache = {});
        const fieldValue = ticket.custom_fields.find(field => field.id === fieldId)?.value;
        
        // Si no hay valor, retornar vacío
        if (!fieldValue) return '';

        // Si no tenemos la configuración del campo cargada, retornar el valor original
        const fieldConfig = customFieldCache[fieldId];
        if (!fieldConfig || !fieldConfig.custom_field_options) {
            return fieldValue;
        }

        // Buscar la opción que coincida con el valor
        const option = fieldConfig.custom_field_options.find(opt => opt.value === fieldValue);
        
        // Retornar el nombre legible si se encuentra, sino el valor original
        return option ? option.name : fieldValue;
    },

    // Funciones específicas para cada campo (versión síncrona)
    getResolutionTeamNameSync(ticket) {
        return this.getCustomFieldNameSync(ticket, RESOLUTION_TEAM_FIELD_ID);
    },

    getIncidenceAreaNameSync(ticket) {
        return this.getCustomFieldNameSync(ticket, INICENCE_AREA_FIELD_ID);
    },

    getCategoryNameSync(ticket) {
        return this.getCustomFieldNameSync(ticket, CATEGORY_FIELD_ID);
    },

    getFixStatusNameSync(ticket) {
        return this.getCustomFieldNameSync(ticket, FIX_STATUS_FIELD_ID);
    },

    getPayerNameSync(ticket) {
        return this.getCustomFieldNameSync(ticket, PAYER_FIELD_ID);
    },

    getOwnersApprovalNameSync(ticket) {
        return this.getCustomFieldNameSync(ticket, OWNERS_APPROVAL_FIELD_ID);
    },

    getBlockNameSync(ticket) {
        return this.getCustomFieldNameSync(ticket, BLOCK_FIELD_ID);
    },

    getFinanceApprovalNameSync(ticket) {
        return this.getCustomFieldNameSync(ticket, FINANCE_APPROVAL_FIELD_ID);
    },

    getIncidenceCauseNameSync(ticket) {
        return this.getCustomFieldNameSync(ticket, INCIDENCE_CAUSE_FIELD_ID);
    },

    // Obtener el nombre legible del resolution team (versión asíncrona - para uso individual)
    async getResolutionTeamName(ticket) {
        const resolutionTeamValue = ticket.custom_fields.find(field => field.id === RESOLUTION_TEAM_FIELD_ID)?.value;
        return await this.getCustomFieldOptionName(RESOLUTION_TEAM_FIELD_ID, resolutionTeamValue);
    },

    // Cargar nombres de usuarios para una lista de tickets
    async loadUserNames(tickets) {
        try {
            const userCache = global.userCache || (global.userCache = {});
            const requesterIds = [];
            const assigneeIds = [];
            const followerIds = [];

            // Recopilar IDs de usuarios que no están en el cache
            tickets.forEach(ticket => {
                if (ticket.requester_id && !userCache[ticket.requester_id]) {
                    requesterIds.push(ticket.requester_id);
                }
                if (ticket.assignee_id && !userCache[ticket.assignee_id]) {
                    assigneeIds.push(ticket.assignee_id);
                }
                // Recopilar IDs de followers
                if (ticket.follower_ids && Array.isArray(ticket.follower_ids)) {
                    ticket.follower_ids.forEach(followerId => {
                        if (followerId && !userCache[followerId]) {
                            followerIds.push(followerId);
                        }
                    });
                }
            });

            // Combinar todos los arrays y eliminar duplicados
            const userIds = [...new Set([...requesterIds, ...assigneeIds, ...followerIds])];

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
    },

    // Cargar nombres de grupos para una lista de tickets
    async loadGroupNames(tickets) {
        try {
            const groupCache = global.groupCache || (global.groupCache = {});
            const groupIds = [];

            // Recopilar IDs de grupos que no están en el cache
            tickets.forEach(ticket => {
                if (ticket.group_id && !groupCache[ticket.group_id]) {
                    groupIds.push(ticket.group_id);
                }
            });

            // Eliminar duplicados
            const uniqueGroupIds = [...new Set(groupIds)];

            // Si no hay grupos para cargar, salir
            if (uniqueGroupIds.length === 0) return;

            console.log(`Cargando nombres para ${uniqueGroupIds.length} grupos...`);

            // Hacer consulta a Zendesk para obtener grupos
            const response = await axios.get(
                `${zendeskConfig.url}/groups/show_many.json?ids=${uniqueGroupIds.join(',')}`,
                { headers: zendeskConfig.headers }
            );

            // Guardar nombres en caché
            if (response.data && response.data.groups) {
                response.data.groups.forEach(group => {
                    groupCache[group.id] = group.name;
                });
            }
        } catch (error) {
            console.error('Error al cargar nombres de grupos:', error);
        }
    }
}; 