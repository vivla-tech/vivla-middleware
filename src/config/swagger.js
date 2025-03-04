import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Vivla API',
            version: '1.0.0',
            description: 'API para gestionar tickets y reviews de Vivla',
        },
        servers: [
            {
                url: '/v1',
                description: 'API v1',
            },
        ],
    },
    apis: ['./src/routes/*.js'], // archivos donde buscar anotaciones
};

export const swaggerSpec = swaggerJsdoc(options); 