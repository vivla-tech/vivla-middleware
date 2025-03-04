import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const routesPath = join(__dirname, '../routes/*.js');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Middleware Zendesk',
            version: '1.0.0',
            description: 'API de integración con Zendesk para gestión de tickets y reseñas',
            contact: {
                name: 'Soporte',
                email: 'support@example.com'
            }
        },
        servers: [
            {
                url: process.env.NODE_ENV === 'production'
                    ? 'https://{url}/v1'
                    : `http://localhost:${process.env.PORT || 3000}/v1`,
                description: process.env.NODE_ENV === 'production' ? 'Servidor de producción' : 'Servidor de desarrollo',
                variables: {
                    url: {
                        default: 'zendesk-middleware.vercel.app',
                        description: 'URL base del servidor'
                    }
                }
            }
        ],
        components: {
            schemas: {
                Ticket: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'ID del ticket'
                        },
                        subject: {
                            type: 'string',
                            description: 'Asunto del ticket'
                        },
                        description: {
                            type: 'string',
                            description: 'Descripción del ticket'
                        },
                        status: {
                            type: 'string',
                            enum: ['new', 'open', 'pending', 'hold', 'solved', 'closed'],
                            description: 'Estado del ticket'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha de creación del ticket'
                        },
                        updated_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha de última actualización del ticket'
                        },
                        priority: {
                            type: 'string',
                            enum: ['low', 'normal', 'high', 'urgent'],
                            description: 'Prioridad del ticket'
                        },
                        requester_name: {
                            type: 'string',
                            description: 'Nombre del solicitante'
                        },
                        assignee_name: {
                            type: 'string',
                            description: 'Nombre del asignado'
                        }
                    }
                },
                TicketStats: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'success'
                        },
                        data: {
                            type: 'object',
                            properties: {
                                homes: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            name: {
                                                type: 'string',
                                                description: 'Nombre de la casa'
                                            },
                                            total_tickets: {
                                                type: 'integer',
                                                description: 'Total de tickets'
                                            },
                                            tickets_new: {
                                                type: 'integer',
                                                description: 'Tickets nuevos'
                                            },
                                            tickets_open: {
                                                type: 'integer',
                                                description: 'Tickets abiertos'
                                            },
                                            tickets_pending: {
                                                type: 'integer',
                                                description: 'Tickets pendientes'
                                            },
                                            tickets_hold: {
                                                type: 'integer',
                                                description: 'Tickets en espera'
                                            },
                                            tickets_solved: {
                                                type: 'integer',
                                                description: 'Tickets resueltos'
                                            },
                                            tickets_closed: {
                                                type: 'integer',
                                                description: 'Tickets cerrados'
                                            },
                                            last_tickets: {
                                                type: 'array',
                                                items: {
                                                    $ref: '#/components/schemas/Ticket'
                                                },
                                                description: 'Los 10 tickets más recientes de esta casa'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                Review: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'ID de la reseña'
                        },
                        home: {
                            type: 'string',
                            description: 'Nombre de la casa'
                        },
                        user: {
                            type: 'string',
                            description: 'Nombre del usuario'
                        },
                        email: {
                            type: 'string',
                            description: 'Email del usuario'
                        },
                        hid: {
                            type: 'string',
                            description: 'ID de la casa'
                        },
                        uid: {
                            type: 'string',
                            description: 'ID del usuario'
                        },
                        type: {
                            type: 'string',
                            enum: ['home', 'stay'],
                            description: 'Tipo de reseña (casa o estancia)'
                        },
                        rating: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 5,
                            description: 'Calificación (1-5)'
                        },
                        comment: {
                            type: 'string',
                            description: 'Comentario de la reseña'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Fecha de creación'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'error'
                        },
                        message: {
                            type: 'string',
                            example: 'Descripción del error'
                        }
                    }
                }
            }
        }
    },
    apis: [routesPath]
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

const swaggerDocs = (app) => {
    // Ruta para la interfaz de Swagger
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Ruta para obtener el archivo JSON de especificación de Swagger
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    console.log(`📝 Documentación Swagger disponible en /api-docs`);
};

export default swaggerDocs; 