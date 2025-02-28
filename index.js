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


// Endpoint para estadísticas de homes
app.get('/api/homes/stats', async (req, res) => {
    try {
        // Obtenemos los tickets de Zendesk usando la misma autorización que el middleware
        const response = await axios.get(`${ZENDESK_URL}/tickets.json?include=users`, {
            headers: headers
        });

        // Verificamos si tenemos datos
        if (!response.data || !response.data.tickets) {
            return res.status(404).json({
                status: 'error',
                message: 'No se encontraron datos de tickets'
            });
        }

        const tickets = response.data.tickets || [];

        // El ID del campo que identifica la casa
        const homeFieldId = 17925940459804;

        // Agrupamos los tickets por casa
        const homeStats = {};

        tickets.forEach(ticket => {
            // Buscamos el valor del campo 'home'
            const homeField = ticket.custom_fields.find(field => field.id === homeFieldId);
            const homeName = homeField && homeField.value ? homeField.value : 'unknown';

            // Inicializamos el contador si es la primera vez que vemos esta casa
            if (!homeStats[homeName]) {
                homeStats[homeName] = {
                    name: homeName,
                    total_tickets: 0,
                    tickets_new: 0,
                    tickets_open: 0,
                    tickets_pending: 0,
                    tickets_hold: 0,
                    tickets_solved: 0,
                    tickets_closed: 0,
                    all_tickets: [], // Array temporal para almacenar todos los tickets
                    last_tickets: []
                };
            }

            // Incrementamos el contador total
            homeStats[homeName].total_tickets++;

            // Incrementamos el contador según el estado del ticket
            switch (ticket.status) {
                case 'new':
                    homeStats[homeName].tickets_new++;
                    break;
                case 'open':
                    homeStats[homeName].tickets_open++;
                    break;
                case 'pending':
                    homeStats[homeName].tickets_pending++;
                    break;
                case 'hold':
                    homeStats[homeName].tickets_hold++;
                    break;
                case 'solved':
                    homeStats[homeName].tickets_solved++;
                    break;
                case 'closed':
                    homeStats[homeName].tickets_closed++;
                    break;
                default:
                    console.log(`Estado de ticket no contemplado: ${ticket.status}`);
                    break;
            }

            // Añadimos el ticket a la lista de todos los tickets de esta casa
            homeStats[homeName].all_tickets.push(ticket);
        });

        // Para cada casa, ordenamos los tickets por fecha y tomamos los 10 más recientes
        Object.keys(homeStats).forEach(homeName => {
            // Ordenamos los tickets por updated_at (más reciente primero)
            homeStats[homeName].all_tickets.sort((a, b) => {
                return new Date(b.updated_at) - new Date(a.updated_at);
            });

            // Tomamos los 10 primeros tickets (o menos si no hay suficientes)
            homeStats[homeName].last_tickets = homeStats[homeName].all_tickets
                .slice(0, 10)
                .map(ticket => {
                    // Incluir solo los campos especificados
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
                });

            // Eliminamos el array temporal de todos los tickets para no devolverlo en la respuesta
            delete homeStats[homeName].all_tickets;
        });

        // Convertimos el objeto a un array como lo requiere la estructura
        const homes = Object.values(homeStats);

        // Devolvemos la respuesta en el formato exacto solicitado
        return res.json({
            status: 'success',
            data: {
                homes: homes
            }
        });

    } catch (error) {
        console.error('Error al obtener estadísticas de homes:', error);
        return res.status(500).json({
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

