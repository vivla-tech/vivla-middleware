import express from 'express';
import dotenv from 'dotenv';
import ticketRoutes from './routes/ticketRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import userRoutes from './routes/userRoutes.js';
import homeRoutes from './routes/homeRoutes.js';
import checkpointRoutes from './routes/checkpointRoutes.js';
import annualRevisionRoutes from './routes/annualRevisionRoutes.js';
import staysRoutes from './routes/staysRoutes.js';
import roomImagesRoutes from './routes/roomImagesRoutes.js';
import proposalRoutes from './routes/proposalRoutes.js';
import zendeskUserRoutes from './routes/zendeskUserRoutes.js';
import zendeskUserTicketsRoutes from './routes/zendeskUserTicketsRoutes.js';
import swaggerDocs from './config/swagger.js';
import { apiKeyAuth } from './middleware/auth.js';
import cors, { corsOptions, corsErrorHandler } from './middleware/cors.js';

// Cargar variables de entorno lo antes posible
dotenv.config();

const { PORT, NODE_ENV } = process.env;

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

// Documentación Swagger - habilitada en todos los entornos
swaggerDocs(app);

// Ruta principal
app.get('/', (req, res) => {
    res.send('Middleware OK');
});

app.use('/v1', apiKeyAuth);

// Rutas
app.use('/v1/tickets', ticketRoutes);
app.use('/v1/reviews', reviewRoutes);
app.use('/v1/report', reportRoutes);
app.use('/v1/users', userRoutes);
app.use('/v1/homes', homeRoutes);
app.use('/v1/checkpoints', checkpointRoutes);
app.use('/v1/getAnnualHomeRevision', annualRevisionRoutes);
app.use('/v1/stays', staysRoutes);
app.use('/v1/homes', roomImagesRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/v1/zendesk-users', zendeskUserRoutes);
app.use('/v1/zendesk-user-tickets', zendeskUserTicketsRoutes);

// Manejo de errores de CORS
app.use(corsErrorHandler);

// Manejo de errores para Vercel
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
    });
});

// En entornos que no sean de producción, inicia el servidor
// En Vercel, esto no se ejecutará ya que NODE_ENV será 'production'
if (NODE_ENV !== 'production') {
    app.listen(PORT || 3000, () => {
        console.log(`Servidor en puerto ${PORT || 3000}`);
    });
}

export default app; 