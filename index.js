import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';
import axios from 'axios';

dotenv.config();

const { ZENDESK_URL, ZENDESK_EMAIL, ZENDESK_TOKEN, PORT } = process.env;

const app = express();

// Middleware para procesar JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const headers = {
    'Authorization': `Basic ${Buffer.from(
        `${ZENDESK_EMAIL}/token:${ZENDESK_TOKEN}`
    ).toString('base64')}`,
    'Content-Type': 'application/json',
}

// Ruta principal
app.get('/', (req, res) => {
    res.send('Zendesk Middleware OK');
});

// Endpoint para obtener un ticket específico por ID usando el middleware proxy
// Importante: esta ruta debe definirse ANTES que la ruta general de tickets
app.use('/api/tickets/:id', createProxyMiddleware({
    target: ZENDESK_URL,
    changeOrigin: true,
    pathRewrite: (path, req) => {
        const ticketId = req.params.id;
        console.log(`Obteniendo ticket con ID: ${ticketId}`);
        return `/tickets/${ticketId}.json`;
    },
    headers: headers,
    onError: (err, req, res) => {
        console.error(`Error al obtener ticket:`, err);
        res.status(500).json({
            error: 'Error al obtener el ticket',
            message: err.message
        });
    }
}));


// listar tickets zendesk - ruta general
app.use('/api/tickets', createProxyMiddleware({
    target: `${ZENDESK_URL}/tickets.json`,
    changeOrigin: true,
    pathRewrite: { '^/api/tickets': '' },
    headers: headers,
    onError: (err, req, res) => {
        console.error('Error:', err);
        res.status(500).send('Error de conexión');
    }
}));


// Funciones auxiliares para el procesamiento de estadísticas de homes
const homeStatsHelpers = {
    // Constantes
    HOME_FIELD_ID: 17925940459804,

    // Obtener tickets de Zendesk
    async fetchTickets() {
        try {
            const response = await axios.get(`${ZENDESK_URL}/tickets.json?include=users`, {
                headers: headers
            });

            if (!response.data || !response.data.tickets) {
                throw new Error('No se encontraron datos de tickets');
            }

            return response.data.tickets;
        } catch (error) {
            console.error('Error al obtener tickets de Zendesk:', error.message);
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
            all_tickets: [], // Array temporal
            last_tickets: []
        };
    },

    // Procesar un ticket e incorporarlo a las estadísticas
    processTicket(ticket, homeStats) {
        // Extraer el nombre del home del ticket
        const homeField = ticket.custom_fields.find(field => field.id === this.HOME_FIELD_ID);
        const homeName = homeField && homeField.value ? homeField.value : 'unknown';

        // Inicializar estadísticas si es la primera vez que vemos este home
        if (!homeStats[homeName]) {
            homeStats[homeName] = this.initializeHomeStats(homeName);
        }

        // Incrementar contador total
        homeStats[homeName].total_tickets++;

        // Incrementar contador por estado
        this.incrementStatusCounter(ticket.status, homeStats[homeName]);

        // Añadir a la lista temporal de tickets
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
            // Ordenar por fecha de actualización (más reciente primero)
            homeStats[homeName].all_tickets.sort((a, b) => {
                return new Date(b.updated_at) - new Date(a.updated_at);
            });

            // Tomar los 10 más recientes
            homeStats[homeName].last_tickets = homeStats[homeName].all_tickets
                .slice(0, 10)
                .map(ticket => this.formatTicket(ticket));

            // Eliminar array temporal
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

// Endpoint para estadísticas de homes
app.get('/api/homes/stats', async (req, res) => {
    try {
        // 1. Obtener tickets de Zendesk
        const tickets = await homeStatsHelpers.fetchTickets();

        // 2. Estructura para almacenar estadísticas
        const homeStats = {};

        // 3. Procesar cada ticket
        tickets.forEach(ticket => {
            homeStatsHelpers.processTicket(ticket, homeStats);
        });

        // 4. Procesar los tickets recientes para cada home
        homeStatsHelpers.processRecentTickets(homeStats);

        // 5. Convertir a array y enviar respuesta
        const homes = Object.values(homeStats);

        return res.json({
            status: 'success',
            data: {
                homes: homes
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas de homes:', error);
        return res.status(error.response?.status || 500).json({
            status: 'error',
            message: 'Error al obtener estadísticas',
            error: error.message
        });
    }
});


if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT || 3000, () => {
        console.log(`Servidor en puerto ${PORT || 3000}`);
    });
}

export default app;

