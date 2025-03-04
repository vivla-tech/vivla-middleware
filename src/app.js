import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import ticketRoutes from './routes/ticketRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

dotenv.config();

const { PORT, NODE_ENV } = process.env;

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Configuración de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: "Vivla API Documentation",
    swaggerOptions: {
        persistAuthorization: true
    }
}));

// Ruta principal
app.get('/', (req, res) => {
    res.send('Middleware OK');
});

// Rutas
app.use('/v1/tickets', ticketRoutes);
app.use('/v1/reviews', reviewRoutes);

// Manejo de errores para Vercel
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
    });
});

if (NODE_ENV !== 'production') {
    app.listen(PORT || 3000, () => {
        console.log(`Servidor en puerto ${PORT || 3000}`);
        console.log(`Documentación Swagger disponible en: http://localhost:${PORT || 3000}/api-docs`);
    });
}

export default app; 