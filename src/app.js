import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ticketRoutes from './routes/ticketRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import userRoutes from './routes/userRoutes.js';
import homeRoutes from './routes/homeRoutes.js';
import swaggerDocs from './config/swagger.js';
import { apiKeyAuth } from './middleware/auth.js';

// Cargar variables de entorno lo antes posible
dotenv.config();

const { PORT, NODE_ENV } = process.env;

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

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